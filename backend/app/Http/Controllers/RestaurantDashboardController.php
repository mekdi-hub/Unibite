<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use App\Models\Order;
use App\Models\MenuItem;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class RestaurantDashboardController extends Controller
{
    /**
     * Get restaurant dashboard statistics
     */
    public function getDashboardStats(Request $request)
    {
        $restaurant = $request->user()->restaurant;

        if (!$restaurant) {
            return response()->json(['message' => 'Restaurant not found'], 404);
        }

        // Get today's orders
        $todayOrders = Order::where('restaurant_id', $restaurant->id)
            ->whereDate('created_at', today())
            ->get();

        // Get pending orders
        $pendingOrders = Order::where('restaurant_id', $restaurant->id)
            ->where('status', 'pending')
            ->count();

        // Get preparing orders
        $preparingOrders = Order::where('restaurant_id', $restaurant->id)
            ->where('status', 'preparing')
            ->count();

        // Get completed orders today
        $completedOrders = Order::where('restaurant_id', $restaurant->id)
            ->where('status', 'completed')
            ->whereDate('created_at', today())
            ->count();

        // Calculate today's revenue
        $todayRevenue = $todayOrders->where('status', 'completed')->sum('total_amount');

        // Get total menu items
        $totalMenuItems = MenuItem::where('restaurant_id', $restaurant->id)->count();

        // Get popular items (most ordered)
        $popularItems = DB::table('order_items')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.restaurant_id', $restaurant->id)
            ->select('menu_items.name', 'menu_items.image', 'menu_items.price', DB::raw('SUM(order_items.quantity) as total_orders'))
            ->groupBy('menu_items.id', 'menu_items.name', 'menu_items.image', 'menu_items.price')
            ->orderByDesc('total_orders')
            ->limit(5)
            ->get();

        // Get recent orders
        $recentOrders = Order::where('restaurant_id', $restaurant->id)
            ->with(['student', 'items.menuItem'])
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'todayOrders' => $todayOrders->count(),
                    'pendingOrders' => $pendingOrders,
                    'preparingOrders' => $preparingOrders,
                    'completedOrders' => $completedOrders,
                    'todayRevenue' => $todayRevenue,
                    'totalMenuItems' => $totalMenuItems,
                ],
                'popularItems' => $popularItems,
                'recentOrders' => $recentOrders,
            ]
        ]);
    }

    /**
     * Get restaurant orders
     */
    public function getOrders(Request $request)
    {
        $user = $request->user();
        $restaurant = $user->restaurant;

        \Log::info('Restaurant Orders Request', [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'user_name' => $user->name,
            'restaurant' => $restaurant ? $restaurant->toArray() : null,
        ]);

        if (!$restaurant) {
            \Log::warning('No restaurant found for user', [
                'user_id' => $user->id,
                'user_role' => $user->role,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Restaurant not found for this user',
                'debug' => [
                    'user_id' => $user->id,
                    'user_role' => $user->role,
                    'user_name' => $user->name,
                ]
            ], 404);
        }

        $query = Order::where('restaurant_id', $restaurant->id)
            ->with(['student', 'items.menuItem', 'delivery']);

        // Log the query
        \Log::info('Orders Query', [
            'restaurant_id' => $restaurant->id,
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings(),
        ]);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by order ID or customer name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('student', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->latest()->paginate(20);

        \Log::info('Restaurant Orders Result', [
            'restaurant_id' => $restaurant->id,
            'total_orders' => $orders->total(),
            'orders_count' => $orders->count(),
            'orders' => $orders->items(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Update order status
     */
    public function updateOrderStatus(Request $request, Order $order)
    {
        $restaurant = $request->user()->restaurant;

        if (!$restaurant || $order->restaurant_id !== $restaurant->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:confirmed,preparing,ready,out_for_delivery,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $newStatus = $request->status;
        $oldStatus = $order->status;

        // Handle cancellation with refund logic
        if ($newStatus === 'cancelled') {
            // Check if order was paid
            if ($order->payment_status === 'paid' && $order->payment) {
                $payment = $order->payment;

                // Prevent double refund
                if ($payment->status === 'refunded') {
                    return response()->json([
                        'success' => false,
                        'message' => 'This order has already been refunded'
                    ], 400);
                }

                // Only refund if order is not yet prepared (pending or confirmed status)
                if (in_array($oldStatus, ['pending', 'confirmed'])) {
                    // Process refund through Chapa
                    $chapaService = new \App\Services\ChapaService();
                    $refundResult = $chapaService->refund(
                        $payment->transaction_id,
                        $order->total_amount,
                        'Order cancelled by restaurant'
                    );

                    if ($refundResult['success']) {
                        // Update payment status
                        $payment->update([
                            'status' => 'refunded',
                            'refund_response' => json_encode($refundResult['data']),
                            'refunded_at' => now()
                        ]);

                        // Update order
                        $order->update([
                            'status' => 'cancelled',
                            'payment_status' => 'refunded'
                        ]);

                        // Send notification to customer
                        $notificationService = new \App\Services\NotificationService();
                        $notificationService->notifyCustomerRefund($order);

                        return response()->json([
                            'success' => true,
                            'message' => 'Order cancelled and refund processed successfully',
                            'data' => $order->load(['student', 'items.menuItem', 'payment'])
                        ]);
                    } else {
                        return response()->json([
                            'success' => false,
                            'message' => 'Order cancelled but refund failed: ' . $refundResult['message']
                        ], 500);
                    }
                } else {
                    // Order is already being prepared or beyond - no refund
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot refund order that is already being prepared or delivered'
                    ], 400);
                }
            }
        }

        // Normal status update (non-cancellation)
        $order->update(['status' => $newStatus]);

        // If order is marked as ready, find nearby riders and send notifications
        if ($newStatus === 'ready') {
            try {
                // Use the RiderAssignmentService to find and notify riders
                $assignmentService = app(\App\Services\RiderAssignmentService::class);
                $assigned = $assignmentService->assignOrderToRiders($order);

                if ($assigned) {
                    \Log::info("Order #{$order->id} assigned to riders successfully");
                } else {
                    \Log::warning("No riders available for order #{$order->id}");
                }
            } catch (\Exception $e) {
                \Log::error("Failed to assign riders for order #{$order->id}: " . $e->getMessage());
                // Don't fail the status update if rider assignment fails
            }
        }

        // Send notification to customer
        $notificationService = new \App\Services\NotificationService();
        $notificationService->notifyCustomerOrderStatus($order, $newStatus);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => $order->load(['student', 'items.menuItem'])
        ]);
    }

    /**
     * Get restaurant menu items
     */
    public function getMenuItems(Request $request)
    {
        $restaurant = $request->user()->restaurant;

        if (!$restaurant) {
            return response()->json(['message' => 'Restaurant not found'], 404);
        }

        $menuItems = MenuItem::where('restaurant_id', $restaurant->id)
            ->with('category')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $menuItems
        ]);
    }

    /**
     * Add menu item
     */
    public function addMenuItem(Request $request)
    {
        $restaurant = $request->user()->restaurant;

        if (!$restaurant) {
            return response()->json(['message' => 'Restaurant not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('image');
        $data['restaurant_id'] = $restaurant->id;

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('menu-items', 'public');
            $data['image'] = $imagePath;
        }

        $menuItem = MenuItem::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Menu item added successfully',
            'data' => $menuItem->load('category')
        ], 201);
    }

    /**
     * Update menu item
     */
    public function updateMenuItem(Request $request, MenuItem $menuItem)
    {
        $restaurant = $request->user()->restaurant;

        if (!$restaurant || $menuItem->restaurant_id !== $restaurant->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('image');

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($menuItem->image) {
                Storage::disk('public')->delete($menuItem->image);
            }
            $imagePath = $request->file('image')->store('menu-items', 'public');
            $data['image'] = $imagePath;
        }

        $menuItem->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Menu item updated successfully',
            'data' => $menuItem->load('category')
        ]);
    }

    /**
     * Delete menu item
     */
    public function deleteMenuItem(MenuItem $menuItem, Request $request)
    {
        $restaurant = $request->user()->restaurant;

        if (!$restaurant || $menuItem->restaurant_id !== $restaurant->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete image
        if ($menuItem->image) {
            Storage::disk('public')->delete($menuItem->image);
        }

        $menuItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu item deleted successfully'
        ]);
    }

    /**
     * Get restaurant notifications
     */
    public function getNotifications(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markNotificationRead(Request $request, Notification $notification)
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->update(['read_at' => now(), 'is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read'
        ]);
    }

    /**
     * Delete multiple notifications
     */
    public function deleteMultipleNotifications(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer'
        ]);

        $count = Notification::whereIn('id', $request->ids)
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => "{$count} notification(s) deleted successfully"
        ]);
    }

    /**
     * Update restaurant profile
     */
    public function updateProfile(Request $request)
    {
        $restaurant = $request->user()->restaurant;

        if (!$restaurant) {
            return response()->json(['message' => 'Restaurant not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'restaurant_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string',
            'phone' => 'required|string|max:20',
            'opening_hours_text' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except('image');

        // Handle image upload
        if ($request->hasFile('image')) {
            if ($restaurant->image) {
                Storage::disk('public')->delete($restaurant->image);
            }
            $imagePath = $request->file('image')->store('restaurants', 'public');
            $data['image'] = $imagePath;
        }

        $restaurant->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Restaurant profile updated successfully',
            'data' => $restaurant
        ]);
    }
}
