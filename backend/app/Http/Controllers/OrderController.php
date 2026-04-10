<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\Delivery;
use App\Models\Payment;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Order::with(['student', 'restaurant', 'items.menuItem', 'delivery', 'payment']);

        // Filter based on user role
        if ($user->isStudent()) {
            $query->byStudent($user->id);
        } elseif ($user->isRestaurant()) {
            $restaurant = $user->restaurant;
            if ($restaurant) {
                $query->byRestaurant($restaurant->id);
            }
        } elseif ($user->isRider()) {
            $query->whereHas('delivery', function ($q) use ($user) {
                $q->where('rider_id', $user->id);
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'message' => 'Orders retrieved successfully',
            'data' => $orders
        ]);
    }

    public function show(Request $request, Order $order)
    {
        $user = $request->user();

        // Check authorization
        if ($user->isStudent() && $order->student_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->isRestaurant()) {
            $restaurant = $user->restaurant;
            if (!$restaurant || $order->restaurant_id !== $restaurant->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $order->load(['student', 'restaurant', 'items.menuItem', 'delivery.rider', 'payment']);

        return response()->json([
            'message' => 'Order retrieved successfully',
            'data' => $order
        ]);
    }

    /**
     * Initialize checkout and payment (without creating order)
     */
    public function initializeCheckout(Request $request)
    {
        \Log::info('Initialize checkout request received', [
            'payment_method' => $request->payment_method,
            'restaurant_id' => $request->restaurant_id,
            'user_id' => $request->user()->id ?? 'not authenticated'
        ]);

        $validator = Validator::make($request->all(), [
            'restaurant_id' => 'required|exists:restaurants,id',
            'delivery_address' => 'required|string',
            'payment_method' => 'required|in:mobile_payment,digital_wallet',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            \Log::error('Checkout validation failed', [
                'errors' => $validator->errors()->toArray(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Only students can place orders
        if (!$request->user()->isStudent()) {
            return response()->json([
                'message' => 'Only students can place orders'
            ], 403);
        }

        try {
            $totalAmount = 0;
            $orderItems = [];

            // Calculate total and validate items
            foreach ($request->items as $item) {
                $menuItem = MenuItem::find($item['menu_item_id']);
                
                if (!$menuItem->is_available) {
                    throw new \Exception("Menu item '{$menuItem->name}' is not available");
                }

                if ($menuItem->restaurant_id != $request->restaurant_id) {
                    throw new \Exception("Menu item '{$menuItem->name}' does not belong to the selected restaurant");
                }

                $itemTotal = $menuItem->price * $item['quantity'];
                $totalAmount += $itemTotal;

                $orderItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $menuItem->price,
                    'total_price' => $itemTotal,
                ];
            }

            // Store checkout data in cache for later order creation
            $checkoutData = [
                'student_id' => $request->user()->id,
                'restaurant_id' => $request->restaurant_id,
                'total_amount' => $totalAmount,
                'delivery_address' => $request->delivery_address,
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
                'items' => $orderItems,
            ];

            // Generate unique checkout ID
            $checkoutId = 'checkout_' . uniqid() . '_' . time();
            
            // Store checkout data in cache for 30 minutes
            \Cache::put($checkoutId, $checkoutData, now()->addMinutes(30));

            // Initialize payment with Chapa
            if ($request->payment_method === 'mobile_payment' || $request->payment_method === 'digital_wallet') {
                $chapaService = new \App\Services\ChapaService();
                
                // Use a valid email format that Chapa accepts
                $userEmail = $request->user()->email;
                $validEmail = 'customer@unibite.com'; // Default to a known working email
                
                // Try to use user's email if it's in a valid format
                if (filter_var($userEmail, FILTER_VALIDATE_EMAIL) && !str_contains($userEmail, '.edu')) {
                    $validEmail = $userEmail;
                }
                
                // Format user name properly
                $userName = $request->user()->name ?? 'Customer';
                $nameParts = explode(' ', trim($userName));
                $firstName = $nameParts[0] ?? 'Customer';
                $lastName = isset($nameParts[1]) ? implode(' ', array_slice($nameParts, 1)) : 'User';
                
                // Format phone number for Ethiopia
                $userPhone = $request->user()->phone ?? '0911000000';
                $formattedPhone = $this->formatPhoneForChapa($userPhone);
                
                // Get frontend URL from environment
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
                
                // Generate transaction reference that includes checkout_id for easier tracking
                $txRef = \App\Services\ChapaService::generateTxRef(time());
                
                // Store mapping between tx_ref and checkout_id in cache
                \Cache::put('tx_ref_' . $txRef, $checkoutId, now()->addMinutes(30));
                
                $paymentData = [
                    'amount' => $totalAmount,
                    'email' => $validEmail,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'phone_number' => $formattedPhone,
                    'tx_ref' => $txRef,
                    'callback_url' => $frontendUrl . '/payment/callback?checkout_id=' . $checkoutId,
                    'return_url' => $frontendUrl . '/payment/callback?checkout_id=' . $checkoutId,
                    'description' => 'Order ' . time()
                ];

                $result = $chapaService->initializePayment($paymentData);

                if ($result['success']) {
                    return response()->json([
                        'message' => 'Checkout initialized successfully',
                        'data' => [
                            'checkout_id' => $checkoutId,
                            'total_amount' => $totalAmount,
                            'payment_url' => $result['data']['data']['checkout_url'],
                            'payment_method' => $request->payment_method
                        ]
                    ]);
                } else {
                    return response()->json([
                        'message' => 'Failed to initialize payment',
                        'error' => $result['message']
                    ], 400);
                }
            }

            return response()->json([
                'message' => 'Payment method not supported for pre-payment',
                'error' => 'Only mobile_payment and digital_wallet support pre-payment'
            ], 400);

        } catch (\Exception $e) {
            \Log::error('Checkout initialization failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Failed to initialize checkout',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get checkout ID from transaction reference
     * This is a fallback for when Chapa doesn't preserve query parameters
     */
    public function getCheckoutIdFromTxRef($txRef)
    {
        \Log::info('Getting checkout ID from tx_ref', ['tx_ref' => $txRef]);
        
        $checkoutId = \Cache::get('tx_ref_' . $txRef);
        
        if (!$checkoutId) {
            \Log::error('Checkout ID not found for tx_ref', ['tx_ref' => $txRef]);
            return response()->json([
                'message' => 'Checkout session not found or expired'
            ], 404);
        }
        
        return response()->json([
            'message' => 'Checkout ID retrieved successfully',
            'data' => [
                'checkout_id' => $checkoutId
            ]
        ]);
    }

    /**
     * Create order after successful payment
     */
    public function createOrderAfterPayment(Request $request)
    {
        \Log::info('Create order after payment request received', [
            'checkout_id' => $request->checkout_id,
            'payment_reference' => $request->payment_reference,
            'user_id' => $request->user()->id ?? 'not authenticated'
        ]);

        $validator = Validator::make($request->all(), [
            'checkout_id' => 'required|string',
            'payment_reference' => 'required|string',
        ]);

        if ($validator->fails()) {
            \Log::error('Create order validation failed', [
                'errors' => $validator->errors()->toArray()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Get checkout data from cache
        $checkoutData = \Cache::get($request->checkout_id);
        
        if (!$checkoutData) {
            \Log::error('Checkout data not found in cache', [
                'checkout_id' => $request->checkout_id
            ]);
            return response()->json([
                'message' => 'Checkout session expired or invalid'
            ], 400);
        }

        \Log::info('Checkout data retrieved from cache', [
            'checkout_id' => $request->checkout_id,
            'student_id' => $checkoutData['student_id'],
            'restaurant_id' => $checkoutData['restaurant_id'],
            'total_amount' => $checkoutData['total_amount']
        ]);

        // Verify payment was successful
        $chapaService = new \App\Services\ChapaService();
        
        // Check if this is a test payment reference
        $isTestPayment = str_starts_with($request->payment_reference, 'TEST-');
        
        if ($isTestPayment) {
            \Log::info('Test payment detected, skipping Chapa verification', [
                'payment_reference' => $request->payment_reference
            ]);
            
            // For test payments, skip Chapa verification and proceed directly
            $paymentStatus = 'success';
        } else {
            // For real payments, verify with Chapa
            $paymentResult = $chapaService->verifyPayment($request->payment_reference);

            \Log::info('Chapa payment verification result', [
                'payment_reference' => $request->payment_reference,
                'success' => $paymentResult['success'],
                'data' => $paymentResult['data'] ?? null
            ]);

            if (!$paymentResult['success']) {
                \Log::error('Payment verification failed', [
                    'payment_reference' => $request->payment_reference,
                    'result' => $paymentResult
                ]);
                return response()->json([
                    'message' => 'Payment verification failed',
                    'error' => 'Payment was not successful'
                ], 400);
            }

            // Check payment status from Chapa response
            $paymentStatus = $paymentResult['data']['data']['status'] ?? null;
            \Log::info('Payment status from Chapa', [
                'status' => $paymentStatus,
                'full_response' => $paymentResult['data']
            ]);

            if ($paymentStatus !== 'success') {
                \Log::error('Payment status is not success', [
                    'status' => $paymentStatus,
                    'payment_reference' => $request->payment_reference
                ]);
                return response()->json([
                    'message' => 'Payment verification failed',
                    'error' => 'Payment status: ' . ($paymentStatus ?? 'unknown')
                ], 400);
            }
        }

        DB::beginTransaction();

        try {
            // Create order with confirmed payment
            $order = Order::create([
                'student_id' => $checkoutData['student_id'],
                'restaurant_id' => $checkoutData['restaurant_id'],
                'total_amount' => $checkoutData['total_amount'],
                'delivery_address' => $checkoutData['delivery_address'],
                'payment_method' => $checkoutData['payment_method'],
                'notes' => $checkoutData['notes'],
                'status' => 'pending', // Start with pending, restaurant will accept it
                'payment_status' => 'paid',
            ]);

            \Log::info('Order created', ['order_id' => $order->id]);

            // Create order items
            foreach ($checkoutData['items'] as $item) {
                $item['order_id'] = $order->id;
                OrderItem::create($item);
            }

            \Log::info('Order items created', ['order_id' => $order->id, 'items_count' => count($checkoutData['items'])]);

            // Create delivery record
            Delivery::create([
                'order_id' => $order->id,
                'status' => 'pending',
            ]);

            \Log::info('Delivery record created', ['order_id' => $order->id]);

            // Create payment record with completed status
            Payment::create([
                'order_id' => $order->id,
                'amount' => $checkoutData['total_amount'],
                'payment_method' => $checkoutData['payment_method'],
                'status' => 'completed',
                'transaction_id' => $request->payment_reference,
                'paid_at' => now(),
            ]);

            \Log::info('Payment record created', ['order_id' => $order->id]);

            DB::commit();

            // Clear checkout data from cache
            \Cache::forget($request->checkout_id);

            $order->load(['student', 'restaurant', 'items.menuItem', 'delivery', 'payment']);

            // Send notifications about successful order
            \Log::info('Sending restaurant notification for paid order: ' . $order->id);
            $restaurantNotificationResult = $this->notificationService->notifyRestaurantNewOrder($order);
            \Log::info('Restaurant notification result: ' . ($restaurantNotificationResult ? 'success' : 'failed'));

            // Send notification to admins about new order
            \Log::info('Sending admin notification for paid order: ' . $order->id);
            $adminNotificationResult = $this->notifyAdminNewOrder($order);
            \Log::info('Admin notification result: ' . ($adminNotificationResult ? 'success' : 'failed'));

            return response()->json([
                'message' => 'Order created successfully after payment confirmation',
                'data' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Failed to create order after payment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to create order after payment',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Store order (only for cash on delivery)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'restaurant_id' => 'required|exists:restaurants,id',
            'delivery_address' => 'required|string',
            'payment_method' => 'required|in:cash_on_delivery',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Only students can place orders
        if (!$request->user()->isStudent()) {
            return response()->json([
                'message' => 'Only students can place orders'
            ], 403);
        }

        // Only allow cash on delivery for this endpoint
        if ($request->payment_method !== 'cash_on_delivery') {
            return response()->json([
                'message' => 'This endpoint only supports cash on delivery. Use /orders/checkout for other payment methods.'
            ], 400);
        }

        DB::beginTransaction();

        try {
            $totalAmount = 0;
            $orderItems = [];

            // Calculate total and prepare order items
            foreach ($request->items as $item) {
                $menuItem = MenuItem::find($item['menu_item_id']);
                
                if (!$menuItem->is_available) {
                    throw new \Exception("Menu item '{$menuItem->name}' is not available");
                }

                if ($menuItem->restaurant_id != $request->restaurant_id) {
                    throw new \Exception("Menu item '{$menuItem->name}' does not belong to the selected restaurant");
                }

                $itemTotal = $menuItem->price * $item['quantity'];
                $totalAmount += $itemTotal;

                $orderItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $menuItem->price,
                    'total_price' => $itemTotal,
                ];
            }

            // Create order
            $order = Order::create([
                'student_id' => $request->user()->id,
                'restaurant_id' => $request->restaurant_id,
                'total_amount' => $totalAmount,
                'delivery_address' => $request->delivery_address,
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
                'status' => 'pending',
                'payment_status' => 'pending',
            ]);

            // Create order items
            foreach ($orderItems as $item) {
                $item['order_id'] = $order->id;
                OrderItem::create($item);
            }

            // Create delivery record
            Delivery::create([
                'order_id' => $order->id,
                'status' => 'pending',
            ]);

            // Create payment record
            Payment::create([
                'order_id' => $order->id,
                'amount' => $totalAmount,
                'payment_method' => $request->payment_method,
                'status' => 'pending',
            ]);

            DB::commit();

            $order->load(['student', 'restaurant', 'items.menuItem', 'delivery', 'payment']);

            // Send notification to restaurant about new order
            \Log::info('Sending restaurant notification for order: ' . $order->id);
            $restaurantNotificationResult = $this->notificationService->notifyRestaurantNewOrder($order);
            \Log::info('Restaurant notification result: ' . ($restaurantNotificationResult ? 'success' : 'failed'));

            // Send notification to admins about new order
            \Log::info('Sending admin notification for order: ' . $order->id);
            $adminNotificationResult = $this->notifyAdminNewOrder($order);
            \Log::info('Admin notification result: ' . ($adminNotificationResult ? 'success' : 'failed'));

            return response()->json([
                'message' => 'Order placed successfully',
                'data' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Failed to place order',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,accepted,preparing,ready,out_for_delivery,delivered,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Check authorization based on status change
        if (in_array($request->status, ['accepted', 'preparing', 'ready'])) {
            // Only restaurant can update these statuses
            if (!$user->isRestaurant()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            
            $restaurant = $user->restaurant;
            if (!$restaurant || $order->restaurant_id !== $restaurant->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        if (in_array($request->status, ['out_for_delivery', 'delivered'])) {
            // Only rider can update these statuses
            if (!$user->isRider()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            
            if ($order->delivery->rider_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $order->update(['status' => $request->status]);

        // Update delivery status accordingly
        if ($order->delivery) {
            if ($request->status === 'ready') {
                $order->delivery->update(['status' => 'pending']);
            } elseif ($request->status === 'out_for_delivery') {
                $order->delivery->markAsPickedUp();
            } elseif ($request->status === 'delivered') {
                $order->delivery->markAsDelivered();
            }
        }

        // Send notification to customer about status change
        $this->notificationService->notifyCustomerOrderStatus($order, $request->status);

        $order->load(['student', 'restaurant', 'items.menuItem', 'delivery.rider', 'payment']);

        return response()->json([
            'message' => 'Order status updated successfully',
            'data' => $order
        ]);
    }

    public function cancel(Request $request, Order $order)
    {
        $user = $request->user();

        // Check authorization
        if ($user->isStudent() && $order->student_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->isRestaurant()) {
            $restaurant = $user->restaurant;
            if (!$restaurant || $order->restaurant_id !== $restaurant->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        if (!$order->canBeCancelled()) {
            return response()->json([
                'message' => 'Order cannot be cancelled at this stage'
            ], 400);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Order cancelled successfully',
            'data' => $order
        ]);
    }

    public function destroy(Request $request, Order $order)
    {
        $user = $request->user();

        // Check authorization - only the student who placed the order can delete it
        if ($user->isStudent() && $order->student_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Admin can delete any order
        if (!$user->isAdmin() && !$user->isStudent()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Only allow deletion of delivered or cancelled orders
        if (!in_array($order->status, ['delivered', 'cancelled'])) {
            return response()->json([
                'message' => 'Only delivered or cancelled orders can be deleted'
            ], 400);
        }

        try {
            // Delete related records first
            $order->items()->delete();
            if ($order->delivery) {
                $order->delivery->delete();
            }
            if ($order->payment) {
                $order->payment->delete();
            }
            
            // Delete the order
            $order->delete();

            return response()->json([
                'message' => 'Order deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Notify admin about new order
     */
    private function notifyAdminNewOrder($order)
    {
        try {
            // Get all admin users
            $admins = \App\Models\User::where('role', 'admin')->get();

            foreach ($admins as $admin) {
                $this->notificationService->createNotification([
                    'user_id' => $admin->id,
                    'type' => 'new_order',
                    'title' => 'New Order Placed',
                    'message' => "A new order #{$order->id} has been placed by {$order->student->name} at {$order->restaurant->restaurant_name} for \${$order->total_amount}",
                    'data' => json_encode([
                        'order_id' => $order->id,
                        'student_name' => $order->student->name,
                        'restaurant_name' => $order->restaurant->restaurant_name,
                        'total_amount' => $order->total_amount,
                        'action_url' => '/orders'
                    ])
                ]);
            }

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to notify admin about new order: ' . $e->getMessage());
            return false;
        }
    }

    private function formatPhoneForChapa($phone)
    {
        if (!$phone) {
            return '251911000000'; // Default test number
        }
        
        // Remove any spaces, dashes, or special characters including +
        $cleanPhone = preg_replace('/[\s\-\(\)\+]/', '', $phone);
        
        // Check if it's an Ethiopian number and format accordingly
        if (preg_match('/^0\d{9}$/', $cleanPhone)) {
            // Ethiopian format: 0911234567 -> 251911234567
            return '251' . substr($cleanPhone, 1);
        } elseif (preg_match('/^251\d{9}$/', $cleanPhone)) {
            // Already in correct format: 251911234567
            return $cleanPhone;
        } elseif (preg_match('/^[79]\d{8}$/', $cleanPhone)) {
            // Ethiopian format without 0: 911234567 -> 251911234567
            return '251' . $cleanPhone;
        }
        
        // Default test number if format is not recognized
        return '251911000000';
    }

    /**
     * Mark order as ready for pickup and assign to riders
     */
    public function markAsReady(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);
            
            // Verify restaurant owns this order
            $user = $request->user();
            if ($user->role !== 'restaurant' || $order->restaurant_id !== $user->restaurant->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Update order status
            $order->update([
                'status' => 'ready_for_pickup',
                'ready_at' => now(),
            ]);

            // Assign to riders
            $assignmentService = app(\App\Services\RiderAssignmentService::class);
            $assigned = $assignmentService->assignOrderToRiders($order);

            if ($assigned) {
                // Notify customer
                $this->notificationService->sendNotification(
                    $order->user_id,
                    'order_ready',
                    'Order Ready for Delivery',
                    "Your order #{$order->id} is ready and a rider is being assigned!"
                );

                return response()->json([
                    'success' => true,
                    'message' => 'Order marked as ready and riders notified',
                    'data' => $order->load(['delivery', 'items'])
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Order marked as ready but no riders available',
                    'data' => $order
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error marking order as ready: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pending delivery requests for rider
     */
    public function getPendingDeliveryRequests(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->role !== 'rider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Get active delivery offers for this rider
            $deliveries = Delivery::with(['order.restaurant', 'order.user', 'order.items.menuItem'])
                ->where('rider_id', $user->id)
                ->where('assignment_status', 'offered')
                ->where('expires_at', '>', now())
                ->get();

            return response()->json([
                'success' => true,
                'data' => $deliveries
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching delivery requests: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Accept delivery request
     */
    public function acceptDelivery(Request $request, $deliveryId)
    {
        try {
            $user = $request->user();
            
            if ($user->role !== 'rider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $delivery = Delivery::findOrFail($deliveryId);

            // Verify this delivery was offered to this rider
            if ($delivery->rider_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'This delivery was not offered to you'
                ], 403);
            }

            // Check if offer has expired
            if ($delivery->expires_at < now()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This delivery offer has expired'
                ], 400);
            }

            // Accept the delivery
            $assignmentService = app(\App\Services\RiderAssignmentService::class);
            $accepted = $assignmentService->acceptDelivery($delivery, $user);

            if ($accepted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Delivery accepted successfully',
                    'data' => $delivery->fresh()->load(['order.restaurant', 'order.user', 'order.items'])
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Error accepting delivery'
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error accepting delivery: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject delivery request
     */
    public function rejectDelivery(Request $request, $deliveryId)
    {
        try {
            $user = $request->user();
            
            if ($user->role !== 'rider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $delivery = Delivery::findOrFail($deliveryId);

            // Verify this delivery was offered to this rider
            if ($delivery->rider_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'This delivery was not offered to you'
                ], 403);
            }

            // Reject the delivery
            $assignmentService = app(\App\Services\RiderAssignmentService::class);
            $rejected = $assignmentService->rejectDelivery($delivery, $user);

            if ($rejected) {
                return response()->json([
                    'success' => true,
                    'message' => 'Delivery rejected, offering to next rider'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Error rejecting delivery'
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error rejecting delivery: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update rider location
     */
    public function updateRiderLocation(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->role !== 'rider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user->update([
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'last_location_update' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Location updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating location: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle rider online/offline status
     */
    public function toggleRiderStatus(Request $request)
    {
        try {
            $user = $request->user();
            
            if ($user->role !== 'rider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $newStatus = $user->rider_status === 'online' ? 'offline' : 'online';
            
            $user->update([
                'rider_status' => $newStatus,
                'is_available' => $newStatus === 'online',
            ]);

            return response()->json([
                'success' => true,
                'message' => "Status changed to {$newStatus}",
                'data' => [
                    'rider_status' => $newStatus,
                    'is_available' => $user->is_available
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error toggling status: ' . $e->getMessage()
            ], 500);
        }
    }
}