<?php

namespace App\Services;

use App\Models\Restaurant;
use App\Models\User;
use App\Models\Notification;
use App\Events\NotificationSent;
use Illuminate\Support\Facades\Mail;
use App\Mail\RestaurantApproved;

class NotificationService
{
    protected $smsService;

    public function __construct()
    {
        $this->smsService = new SmsService();
    }

    /**
     * Send restaurant approval notification
     */
    public function sendRestaurantApprovalNotification(Restaurant $restaurant)
    {
        $user = $restaurant->user;
        
        if (!$user || !$user->email) {
            return false;
        }

        try {
            // Send email notification
            Mail::to($user->email)->send(new RestaurantApproved($restaurant, $user));

            // Send SMS notification
            if ($restaurant->phone) {
                $this->smsService->sendRestaurantApprovalSms(
                    $restaurant->phone,
                    $restaurant->restaurant_name
                );
            }

            // Create in-app notification
            $message = "🎉 Congratulations!\n\nYour restaurant '{$restaurant->restaurant_name}' has been approved and is now live on UniBite!\n\n✅ You can now:\n• Receive orders from students\n• Manage your menu\n• Track your earnings\n\nStart receiving orders today!";

            $this->createNotification([
                'user_id' => $user->id,
                'type' => 'restaurant_approved',
                'title' => '🎊 Restaurant Approved - You\'re Live!',
                'message' => $message,
                'data' => json_encode([
                    'restaurant_id' => $restaurant->id,
                    'restaurant_name' => $restaurant->restaurant_name,
                    'action_url' => '/restaurant-dashboard'
                ])
            ]);

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to send restaurant approval notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send restaurant rejection notification
     */
    public function sendRestaurantRejectionNotification(Restaurant $restaurant, $reason = null)
    {
        $user = $restaurant->user;
        
        if (!$user || !$user->email) {
            return false;
        }

        try {
            // Send SMS notification
            if ($restaurant->phone) {
                $this->smsService->sendRestaurantRejectionSms(
                    $restaurant->phone,
                    $restaurant->restaurant_name
                );
            }

            // Create in-app notification
            $message = "Your restaurant '{$restaurant->restaurant_name}' registration has been rejected.";
            if ($reason) {
                $message .= " Reason: {$reason}";
            }

            $this->createNotification([
                'user_id' => $user->id,
                'type' => 'restaurant_rejected',
                'title' => 'Restaurant Registration Rejected',
                'message' => $message,
                'data' => json_encode([
                    'restaurant_id' => $restaurant->id,
                    'restaurant_name' => $restaurant->restaurant_name,
                    'reason' => $reason
                ])
            ]);

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to send restaurant rejection notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify admin about new restaurant registration
     */
    public function notifyAdminNewRestaurant(Restaurant $restaurant)
    {
        try {
            // Get all admin users
            $admins = User::where('role', 'admin')->get();

            foreach ($admins as $admin) {
                $this->createNotification([
                    'user_id' => $admin->id,
                    'type' => 'new_restaurant_registration',
                    'title' => 'New Restaurant Registration',
                    'message' => "A new restaurant '{$restaurant->restaurant_name}' has registered and is waiting for approval.",
                    'data' => json_encode([
                        'restaurant_id' => $restaurant->id,
                        'restaurant_name' => $restaurant->restaurant_name,
                        'action_url' => '/notifications'
                    ])
                ]);
            }

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to notify admin about new restaurant: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send order notification to restaurant
     */
    public function notifyRestaurantNewOrder($order)
    {
        try {
            $restaurant = $order->restaurant;
            $user = $restaurant->user;

            if (!$user) {
                return false;
            }

            $customerName = $order->student->name ?? 'Customer';
            $orderNumber = "#{$order->id}";
            $amount = number_format($order->total_amount, 2) . ' ETB';
            $itemCount = $order->items->count();

            $message = "🎉 New Order Received!\n\nOrder {$orderNumber}\nCustomer: {$customerName}\nItems: {$itemCount}\nTotal: {$amount}\n\n⏰ Please confirm and start preparing the order as soon as possible!";

            // Send SMS notification
            if ($restaurant->phone) {
                $this->smsService->sendNewOrderSms(
                    $restaurant->phone,
                    $order->id,
                    $order->total_amount
                );
            }

            $this->createNotification([
                'user_id' => $user->id,
                'type' => 'new_order',
                'title' => '🔔 New Order Received!',
                'message' => $message,
                'data' => json_encode([
                    'order_id' => $order->id,
                    'customer_name' => $customerName,
                    'total_price' => $order->total_amount,
                    'item_count' => $itemCount,
                    'action_url' => '/restaurant-dashboard?tab=orders'
                ])
            ]);

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to notify restaurant about new order: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send order status update to customer
     */
    public function notifyCustomerOrderStatus($order, $status)
    {
        try {
            $customer = $order->student;

            if (!$customer) {
                return false;
            }

            $restaurantName = $order->restaurant->restaurant_name ?? 'the restaurant';
            $orderNumber = "#{$order->id}";
            $amount = number_format($order->total_amount, 2) . ' ETB';

            $statusMessages = [
                'pending' => [
                    'title' => '🎉 Order Placed Successfully!',
                    'message' => "Your order {$orderNumber} from {$restaurantName} has been placed successfully. Total: {$amount}. Waiting for restaurant confirmation."
                ],
                'confirmed' => [
                    'title' => '✅ Order Confirmed!',
                    'message' => "{$restaurantName} has confirmed your order {$orderNumber}. They are now preparing your delicious meal!"
                ],
                'preparing' => [
                    'title' => '👨‍🍳 Your Food is Being Prepared',
                    'message' => "Great news! {$restaurantName} is now preparing your order {$orderNumber}. Your food will be ready soon!"
                ],
                'ready' => [
                    'title' => '🍽️ Order Ready!',
                    'message' => "Your order {$orderNumber} from {$restaurantName} is ready! A rider will pick it up shortly for delivery."
                ],
                'out_for_delivery' => [
                    'title' => '🚴 On the Way!',
                    'message' => "Your order {$orderNumber} is out for delivery! Your food will arrive at your doorstep soon. Get ready to enjoy!"
                ],
                'delivered' => [
                    'title' => '✨ Delivered Successfully!',
                    'message' => "Your order {$orderNumber} has been delivered! Enjoy your meal from {$restaurantName}. Bon appétit! 🍴"
                ],
                'completed' => [
                    'title' => '🎊 Order Complete!',
                    'message' => "Thank you for ordering from {$restaurantName}! We hope you enjoyed your meal. Order again soon!"
                ],
                'cancelled' => [
                    'title' => '❌ Order Cancelled',
                    'message' => "Your order {$orderNumber} from {$restaurantName} has been cancelled. If you paid online, a refund will be processed within 5-7 business days."
                ]
            ];

            $notification = $statusMessages[$status] ?? [
                'title' => 'Order Status Updated',
                'message' => "Your order {$orderNumber} status has been updated to: {$status}"
            ];

            // Send SMS notification
            if ($customer->phone) {
                $this->smsService->sendOrderStatusSms(
                    $customer->phone,
                    $order->id,
                    $status
                );
            }

            $this->createNotification([
                'user_id' => $customer->id,
                'type' => 'order_status_update',
                'title' => $notification['title'],
                'message' => $notification['message'],
                'data' => json_encode([
                    'order_id' => $order->id,
                    'status' => $status,
                    'restaurant_name' => $restaurantName,
                    'amount' => $order->total_amount,
                    'action_url' => '/orders'
                ])
            ]);

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to notify customer about order status: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify customer about refund
     */
    public function notifyCustomerRefund($order)
    {
        try {
            $customer = $order->student;

            if (!$customer) {
                return false;
            }

            $restaurantName = $order->restaurant->restaurant_name ?? 'the restaurant';
            $orderNumber = "#{$order->id}";
            $amount = number_format($order->total_amount, 2) . ' ETB';

            $message = "💰 Refund Processed\n\nYour order {$orderNumber} from {$restaurantName} has been cancelled.\n\n✅ Refund Amount: {$amount}\n⏰ Processing Time: 5-7 business days\n\nThe amount will be credited back to your original payment method. You'll receive a confirmation once the refund is complete.\n\nNeed help? Contact our support team.";

            // Send SMS notification
            if ($customer->phone) {
                $this->smsService->sendRefundSms(
                    $customer->phone,
                    $order->id,
                    $order->total_amount
                );
            }

            $this->createNotification([
                'user_id' => $customer->id,
                'type' => 'payment_refunded',
                'title' => '💰 Refund Processed - Order Cancelled',
                'message' => $message,
                'data' => json_encode([
                    'order_id' => $order->id,
                    'amount' => $order->total_amount,
                    'restaurant_name' => $restaurantName,
                    'refund_status' => 'processing',
                    'action_url' => '/orders'
                ])
            ]);

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to notify customer about refund: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Create a notification record
     */
    public function createNotification(array $data)
    {
        $notification = Notification::create([
            'user_id' => $data['user_id'],
            'type' => $data['type'],
            'title' => $data['title'],
            'message' => $data['message'],
            'data' => $data['data'] ?? null,
            'read_at' => null
        ]);

        // Broadcast the notification in real-time
        broadcast(new NotificationSent($notification, $data['user_id']));

        return $notification;
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($notificationId)
    {
        $notification = Notification::find($notificationId);
        
        if ($notification) {
            $notification->update(['read_at' => now()]);
            return true;
        }

        return false;
    }

    /**
     * Mark all notifications as read for a user
     */
    public function markAllAsRead($userId)
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    /**
     * Get unread notifications count for a user
     */
    public function getUnreadCount($userId)
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    /**
     * Get all notifications for a user
     */
    public function getUserNotifications($userId, $limit = 50)
    {
        return Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Delete old notifications
     */
    public function deleteOldNotifications($days = 30)
    {
        return Notification::where('created_at', '<', now()->subDays($days))
            ->delete();
    }

    /**
     * Delete a notification
     */
    public function deleteNotification($notificationId, $userId)
    {
        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $userId)
            ->first();
        
        if ($notification) {
            $notification->delete();
            return true;
        }

        return false;
    }

    /**
     * Delete multiple notifications
     */
    public function deleteMultipleNotifications(array $notificationIds, $userId)
    {
        return Notification::whereIn('id', $notificationIds)
            ->where('user_id', $userId)
            ->delete();
    }
}
