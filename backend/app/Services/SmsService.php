<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected $apiUrl;
    protected $apiKey;
    protected $senderId;

    public function __construct()
    {
        $this->apiUrl = config('services.sms.api_url');
        $this->apiKey = config('services.sms.api_key');
        $this->senderId = config('services.sms.sender_id', '+251953419361'); // Use phone number as sender
    }

    /**
     * Send SMS using HTTP SMS API
     */
    public function sendSms($phoneNumber, $message)
    {
        try {
            // Clean phone number (remove spaces, dashes, etc.)
            $phoneNumber = $this->cleanPhoneNumber($phoneNumber);

            // Validate phone number
            if (!$this->isValidPhoneNumber($phoneNumber)) {
                Log::error("Invalid phone number: {$phoneNumber}");
                return false;
            }

            // Send SMS via HTTP API
            $response = Http::timeout(30)
                ->withHeaders([
                    'x-api-key' => $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post($this->apiUrl, [
                    'from' => $this->senderId,
                    'to' => $phoneNumber,
                    'content' => $message,
                ]);

            // Check if request was successful
            if ($response->successful()) {
                Log::info("SMS sent successfully to {$phoneNumber}");
                return true;
            } else {
                Log::error("Failed to send SMS to {$phoneNumber}: " . $response->body());
                return false;
            }
        } catch (\Exception $e) {
            Log::error("SMS sending error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send restaurant approval SMS
     */
    public function sendRestaurantApprovalSms($phoneNumber, $restaurantName)
    {
        $message = "Hello! Your restaurant '{$restaurantName}' has been approved on UniBite Delivery Platform. You can now login and start receiving orders. Visit: " . config('app.frontend_url') . "/login - UniBite Team";
        
        return $this->sendSms($phoneNumber, $message);
    }

    /**
     * Send restaurant rejection SMS
     */
    public function sendRestaurantRejectionSms($phoneNumber, $restaurantName)
    {
        $message = "Hello! Your restaurant '{$restaurantName}' registration has been reviewed. Please contact support for more information. - UniBite Team";
        
        return $this->sendSms($phoneNumber, $message);
    }

    /**
     * Send new order notification SMS
     */
    public function sendNewOrderSms($phoneNumber, $orderId, $totalPrice)
    {
        $message = "New Order Alert! Order #{$orderId} received. Amount: \${$totalPrice}. Login to your dashboard to view details. - UniBite";
        
        return $this->sendSms($phoneNumber, $message);
    }

    /**
     * Send order status update SMS
     */
    public function sendOrderStatusSms($phoneNumber, $orderId, $status)
    {
        $statusMessages = [
            'confirmed' => 'Your order #%s has been confirmed by the restaurant.',
            'preparing' => 'Your order #%s is being prepared.',
            'ready' => 'Your order #%s is ready for pickup/delivery.',
            'out_for_delivery' => 'Your order #%s is out for delivery.',
            'delivered' => 'Your order #%s has been delivered. Enjoy your meal!',
            'completed' => 'Your order #%s is complete. Thank you!',
            'cancelled' => 'Your order #%s has been cancelled.'
        ];

        $message = sprintf($statusMessages[$status] ?? 'Your order #%s status has been updated.', $orderId);
        $message .= " - UniBite";
        
        return $this->sendSms($phoneNumber, $message);
    }

    /**
     * Send refund notification SMS
     */
    public function sendRefundSms($phoneNumber, $orderId, $amount)
    {
        $message = "Your order #{$orderId} has been cancelled. A refund of {$amount} ETB has been processed and will be credited to your account within 5-7 business days. - UniBite";
        
        return $this->sendSms($phoneNumber, $message);
    }

    /**
     * Clean phone number
     */
    private function cleanPhoneNumber($phoneNumber)
    {
        // Remove all non-numeric characters except +
        $cleaned = preg_replace('/[^0-9+]/', '', $phoneNumber);
        
        // If number doesn't start with +, add country code (assuming Ethiopia +251)
        if (!str_starts_with($cleaned, '+')) {
            // Remove leading 0 if present
            $cleaned = ltrim($cleaned, '0');
            // Add Ethiopia country code
            $cleaned = '+251' . $cleaned;
        }
        
        return $cleaned;
    }

    /**
     * Validate phone number format
     */
    private function isValidPhoneNumber($phoneNumber)
    {
        // Basic validation: should start with + and have 10-15 digits
        return preg_match('/^\+[0-9]{10,15}$/', $phoneNumber);
    }

    /**
     * Send bulk SMS
     */
    public function sendBulkSms(array $phoneNumbers, $message)
    {
        $results = [];
        
        foreach ($phoneNumbers as $phoneNumber) {
            $results[$phoneNumber] = $this->sendSms($phoneNumber, $message);
        }
        
        return $results;
    }
}
