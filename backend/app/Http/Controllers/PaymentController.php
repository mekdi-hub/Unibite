<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Order;
use App\Services\ChapaService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    protected $chapaService;
    protected $notificationService;

    public function __construct(ChapaService $chapaService, NotificationService $notificationService)
    {
        $this->chapaService = $chapaService;
        $this->notificationService = $notificationService;
    }

    /**
     * Initialize Chapa payment
     */
    public function initializeChapaPayment(Request $request, Order $order)
    {
        try {
            \Log::info('Chapa payment initialization started', [
                'order_id' => $order->id,
                'user_id' => $request->user()->id,
                'request_data' => $request->all()
            ]);

            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'first_name' => 'required|string',
                'last_name' => 'required|string',
                'phone_number' => 'required|string',
            ]);

            if ($validator->fails()) {
                \Log::error('Validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if user owns this order
            if ($order->student_id !== $request->user()->id) {
                \Log::error('Unauthorized access attempt', [
                    'order_student_id' => $order->student_id,
                    'request_user_id' => $request->user()->id
                ]);
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Check if order is already paid
            if ($order->payment_status === 'paid') {
                \Log::warning('Order already paid', ['order_id' => $order->id]);
                return response()->json([
                    'message' => 'Order is already paid'
                ], 400);
            }

            // Format phone number for Chapa (Ethiopian format)
            $phoneNumber = $request->phone_number;
            
            \Log::info('Phone number before formatting', ['original' => $phoneNumber]);
            
            // Remove any spaces, dashes, or special characters
            $phoneNumber = preg_replace('/[\s\-\(\)\+]/', '', $phoneNumber);
            
            \Log::info('Phone number after cleaning', ['cleaned' => $phoneNumber]);
            
            // Convert to format: 251XXXXXXXXX (without +)
            if (strpos($phoneNumber, '0') === 0) {
                // If starts with 0, replace with 251
                $phoneNumber = '251' . substr($phoneNumber, 1);
            } elseif (strpos($phoneNumber, '251') === 0) {
                // Already in correct format
                $phoneNumber = $phoneNumber;
            } elseif (strlen($phoneNumber) === 9 && in_array($phoneNumber[0], ['7', '9'])) {
                // If it's 9 digits starting with 7 or 9, add 251
                $phoneNumber = '251' . $phoneNumber;
            } else {
                // Try to extract valid digits
                $phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber);
                if (strlen($phoneNumber) === 9 && in_array($phoneNumber[0], ['7', '9'])) {
                    $phoneNumber = '251' . $phoneNumber;
                } elseif (strlen($phoneNumber) === 10 && $phoneNumber[0] === '0') {
                    $phoneNumber = '251' . substr($phoneNumber, 1);
                }
            }

            \Log::info('Phone number after formatting', ['formatted' => $phoneNumber]);

            // Validate Ethiopian phone number format (251XXXXXXXXX - 12 digits total)
            // Ethiopian mobile numbers start with 7 or 9 after country code
            if (!preg_match('/^251[79]\d{8}$/', $phoneNumber)) {
                \Log::error('Invalid phone number format after validation', [
                    'phone' => $phoneNumber,
                    'length' => strlen($phoneNumber),
                    'pattern_match' => preg_match('/^251[79]\d{8}$/', $phoneNumber)
                ]);
                return response()->json([
                    'message' => 'Invalid phone number format. Please use Ethiopian phone number format (e.g., 251911234567 or 0911234567)',
                    'error' => 'Invalid phone number',
                    'debug' => [
                        'received' => $request->phone_number,
                        'formatted' => $phoneNumber,
                        'length' => strlen($phoneNumber)
                    ]
                ], 400);
            }

            \Log::info('Phone number validation passed', ['final_phone' => $phoneNumber]);

            // Validate and sanitize email for Chapa
            $email = filter_var($request->email, FILTER_VALIDATE_EMAIL);
            if (!$email) {
                // If email is invalid, use a test email
                $email = 'test@unibite.com';
            }
            
            \Log::info('Email for Chapa', ['original' => $request->email, 'validated' => $email]);

            // Generate transaction reference
            $txRef = ChapaService::generateTxRef($order->id);

            // Prepare payment data
            $paymentData = [
                'amount' => $order->total_amount,
                'email' => $email,
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'phone_number' => $phoneNumber,
                'tx_ref' => $txRef,
                'callback_url' => env('FRONTEND_URL') . '/payment/callback',
                'return_url' => env('FRONTEND_URL') . '/orders',
                'description' => 'Order ' . $order->id,
            ];

            \Log::info('Payment data prepared', ['payment_data' => $paymentData]);

            // Initialize payment with Chapa
            $result = $this->chapaService->initializePayment($paymentData);

            \Log::info('Chapa service result', ['result' => $result]);

            if ($result['success']) {
                // Update payment record with transaction reference
                $order->payment->update([
                    'transaction_id' => $txRef,
                    'status' => 'pending'
                ]);

                \Log::info('Payment initialized successfully', [
                    'order_id' => $order->id,
                    'tx_ref' => $txRef
                ]);

                return response()->json([
                    'message' => 'Payment initialized successfully',
                    'data' => [
                        'checkout_url' => $result['data']['data']['checkout_url'],
                        'tx_ref' => $txRef
                    ]
                ]);
            }

            \Log::error('Payment initialization failed', [
                'result' => $result
            ]);

            return response()->json([
                'message' => $result['message'] ?? 'Failed to initialize payment',
                'error' => $result['data'] ?? null
            ], 400);

        } catch (\Exception $e) {
            \Log::error('Exception in initializeChapaPayment', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'An error occurred: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify Chapa payment
     */
    public function verifyChapaPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tx_ref' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify payment with Chapa
        $result = $this->chapaService->verifyPayment($request->tx_ref);

        if (!$result['success']) {
            return response()->json([
                'message' => 'Payment verification failed',
                'error' => $result['message']
            ], 400);
        }

        $paymentData = $result['data']['data'];

        // Find payment by transaction reference
        $payment = Payment::where('transaction_id', $request->tx_ref)->first();

        if (!$payment) {
            return response()->json([
                'message' => 'Payment record not found'
            ], 404);
        }

        // Check if payment is successful
        if ($paymentData['status'] === 'success') {
            $payment->markAsCompleted($request->tx_ref);
            $payment->order->update(['payment_status' => 'paid']);

            // Send notifications about successful payment
            \Log::info('Sending payment notifications for order: ' . $payment->order_id);
            $notificationResult = $this->sendPaymentNotifications($payment->order);
            \Log::info('Notification result: ' . ($notificationResult ? 'success' : 'failed'));

            return response()->json([
                'message' => 'Payment verified successfully',
                'data' => [
                    'status' => 'success',
                    'order_id' => $payment->order_id,
                    'amount' => $paymentData['amount'],
                ]
            ]);
        }

        return response()->json([
            'message' => 'Payment not successful',
            'data' => [
                'status' => $paymentData['status'],
            ]
        ], 400);
    }
    public function processPayment(Request $request, Order $order)
    {
        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|in:cash_on_delivery,mobile_payment,digital_wallet',
            'transaction_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user is the student who placed the order
        if (!$request->user()->isStudent() || $order->student_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $payment = $order->payment;

        if (!$payment) {
            return response()->json([
                'message' => 'Payment record not found'
            ], 404);
        }

        if ($payment->isCompleted()) {
            return response()->json([
                'message' => 'Payment already completed'
            ], 400);
        }

        // Simulate payment processing
        if ($request->payment_method === 'cash_on_delivery') {
            // Cash on delivery - mark as pending until delivery
            $payment->update([
                'payment_method' => $request->payment_method,
                'status' => 'pending',
            ]);
        } else {
            // Digital payments - mark as completed
            $payment->markAsCompleted($request->transaction_id);
            $order->update(['payment_status' => 'paid']);

            // Send notifications about successful payment
            $this->sendPaymentNotifications($order);
        }

        return response()->json([
            'message' => 'Payment processed successfully',
            'data' => $payment
        ]);
    }

    public function getPayment(Request $request, Order $order)
    {
        // Check authorization
        $user = $request->user();
        
        if ($user->isStudent() && $order->student_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->isRestaurant()) {
            $restaurant = $user->restaurant;
            if (!$restaurant || $order->restaurant_id !== $restaurant->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $payment = $order->payment;

        if (!$payment) {
            return response()->json([
                'message' => 'Payment record not found'
            ], 404);
        }

        return response()->json([
            'message' => 'Payment retrieved successfully',
            'data' => $payment
        ]);
    }

    public function confirmCashPayment(Request $request, Order $order)
    {
        // Only riders can confirm cash payments upon delivery
        if (!$request->user()->isRider()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $payment = $order->payment;

        if (!$payment || $payment->payment_method !== 'cash_on_delivery') {
            return response()->json([
                'message' => 'Invalid payment method'
            ], 400);
        }

        if ($order->status !== 'delivered') {
            return response()->json([
                'message' => 'Order must be delivered first'
            ], 400);
        }

        $payment->markAsCompleted();
        $order->update(['payment_status' => 'paid']);

        // Send notifications about successful payment
        $this->sendPaymentNotifications($order);

        return response()->json([
            'message' => 'Cash payment confirmed successfully',
            'data' => $payment
        ]);
    }

    /**
     * Send notifications when payment is completed
     */
    private function sendPaymentNotifications($order)
    {
        try {
            // Notify restaurant about payment confirmation
            $restaurant = $order->restaurant;
            $restaurantUser = $restaurant->user;

            if ($restaurantUser) {
                $this->notificationService->createNotification([
                    'user_id' => $restaurantUser->id,
                    'type' => 'payment_received',
                    'title' => 'Payment Received',
                    'message' => "Payment for order #{$order->id} has been confirmed. You can now start preparing the order.",
                    'data' => json_encode([
                        'order_id' => $order->id,
                        'amount' => $order->total_amount,
                        'action_url' => '/orders'
                    ])
                ]);
            }

            // Notify customer about payment confirmation
            $customer = $order->student;
            if ($customer) {
                $this->notificationService->createNotification([
                    'user_id' => $customer->id,
                    'type' => 'payment_confirmed',
                    'title' => 'Payment Confirmed',
                    'message' => "Your payment for order #{$order->id} has been confirmed. The restaurant will start preparing your order soon.",
                    'data' => json_encode([
                        'order_id' => $order->id,
                        'amount' => $order->total_amount,
                        'action_url' => '/orders'
                    ])
                ]);
            }

            // Notify admins about successful payment
            $admins = \App\Models\User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $this->notificationService->createNotification([
                    'user_id' => $admin->id,
                    'type' => 'payment_completed',
                    'title' => 'Payment Completed',
                    'message' => "Payment for order #{$order->id} has been completed. Amount: \${$order->total_amount}",
                    'data' => json_encode([
                        'order_id' => $order->id,
                        'amount' => $order->total_amount,
                        'customer_name' => $order->student->name,
                        'restaurant_name' => $order->restaurant->restaurant_name,
                        'action_url' => '/orders'
                    ])
                ]);
            }

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to send payment notifications: ' . $e->getMessage());
            return false;
        }
    }
}