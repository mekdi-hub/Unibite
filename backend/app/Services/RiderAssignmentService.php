<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Delivery;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class RiderAssignmentService
{
    const MAX_DISTANCE_KM = 10; // Maximum distance to search for riders
    const OFFER_TIMEOUT_SECONDS = 20; // Time rider has to respond
    const MAX_OFFER_ATTEMPTS = 5; // Maximum number of riders to try

    /**
     * Find available riders near the restaurant
     */
    public function findAvailableRiders($restaurantLat, $restaurantLng, $maxDistance = self::MAX_DISTANCE_KM)
    {
        // Haversine formula to calculate distance
        $riders = User::where('role', 'rider')
            ->where('rider_status', 'online')
            ->where('is_available', true)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->select('*')
            ->selectRaw(
                '( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance',
                [$restaurantLat, $restaurantLng, $restaurantLat]
            )
            ->having('distance', '<', $maxDistance)
            ->orderBy('distance', 'asc')
            ->get();

        return $riders;
    }

    /**
     * Assign order to riders (send offers)
     */
    public function assignOrderToRiders(Order $order)
    {
        try {
            // Get restaurant location
            $restaurant = $order->restaurant;
            if (!$restaurant || !$restaurant->latitude || !$restaurant->longitude) {
                Log::error("Restaurant location not set for order {$order->id}");
                return false;
            }

            Log::info("Restaurant location: Lat={$restaurant->latitude}, Lng={$restaurant->longitude}");

            // Find available riders
            $riders = $this->findAvailableRiders(
                $restaurant->latitude,
                $restaurant->longitude
            );

            Log::info("Found {$riders->count()} available riders for order {$order->id}");

            if ($riders->isEmpty()) {
                Log::warning("No available riders found for order {$order->id}");
                return false;
            }

            // Create or get delivery record
            $delivery = Delivery::firstOrCreate(
                ['order_id' => $order->id],
                [
                    'rider_id' => null,
                    'status' => 'pending',
                    'assignment_status' => 'pending',
                    'pickup_time' => null,
                    'delivery_time' => null,
                ]
            );

            // Send notifications to multiple riders (top 3 closest)
            $notifiedCount = 0;
            foreach ($riders->take(3) as $index => $rider) {
                $this->sendOfferToRider($order, $delivery, $rider, $index === 0);
                $notifiedCount++;
                Log::info("Delivery offer sent to rider {$rider->id} ({$rider->name}) for order {$order->id}");
            }

            Log::info("Sent delivery offers to {$notifiedCount} riders for order {$order->id}");

            return true;
        } catch (\Exception $e) {
            Log::error("Error assigning order to riders: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send delivery offer to a specific rider
     */
    public function sendOfferToRider(Order $order, Delivery $delivery, User $rider, $isFirstOffer = false)
    {
        try {
            // Only update delivery record for the first offer
            if ($isFirstOffer) {
                $delivery->update([
                    'assignment_status' => 'offered',
                    'offered_at' => now(),
                    'expires_at' => now()->addSeconds(self::OFFER_TIMEOUT_SECONDS),
                    'offer_count' => $delivery->offer_count + 1,
                ]);
            }

            // Calculate delivery fee
            $deliveryFee = $this->calculateDeliveryFee($order);

            // Create notification for rider
            Notification::create([
                'user_id' => $rider->id,
                'type' => 'delivery_request',
                'title' => 'New Delivery Request',
                'message' => "New delivery from {$order->restaurant->restaurant_name}",
                'data' => json_encode([
                    'order_id' => $order->id,
                    'delivery_id' => $delivery->id,
                    'restaurant_name' => $order->restaurant->restaurant_name,
                    'restaurant_address' => $order->restaurant->address,
                    'restaurant_phone' => $order->restaurant->phone,
                    'customer_name' => $order->user->name,
                    'customer_phone' => $order->user->phone,
                    'customer_address' => $order->delivery_address ?? $order->user->address,
                    'distance' => $this->calculateDistance(
                        $order->restaurant->latitude,
                        $order->restaurant->longitude,
                        $order->user->latitude ?? 0,
                        $order->user->longitude ?? 0
                    ),
                    'earning' => $deliveryFee,
                    'expires_at' => $delivery->expires_at ?? now()->addSeconds(self::OFFER_TIMEOUT_SECONDS),
                    'items_count' => $order->items->count(),
                    'total_amount' => $order->total_amount,
                ]),
                'read_at' => null,
            ]);

            // TODO: Send push notification to rider's device
            // $this->sendPushNotification($rider, $order);

            Log::info("Delivery offer sent to rider {$rider->id} for order {$order->id}");

            return true;
        } catch (\Exception $e) {
            Log::error("Error sending offer to rider: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Handle rider accepting the delivery
     */
    public function acceptDelivery(Delivery $delivery, User $rider)
    {
        try {
            DB::beginTransaction();

            // Update delivery with rider assignment
            $delivery->update([
                'rider_id' => $rider->id,
                'assignment_status' => 'accepted',
                'accepted_at' => now(),
                'status' => 'assigned',
            ]);

            // Load the order relationship if not loaded
            if (!$delivery->relationLoaded('order')) {
                $delivery->load('order');
            }

            // Check if order exists
            if (!$delivery->order) {
                throw new \Exception('Order not found for this delivery');
            }

            // Update order with rider assignment
            $delivery->order->update([
                'rider_id' => $rider->id,
                'status' => 'out_for_delivery',
                'assigned_at' => now(),
            ]);

            // Update rider status to busy
            $rider->update([
                'rider_status' => 'busy',
                'is_available' => false,
            ]);

            // Load restaurant relationship
            if (!$delivery->order->relationLoaded('restaurant')) {
                $delivery->order->load('restaurant');
            }

            // Notify restaurant if it exists
            if ($delivery->order->restaurant && $delivery->order->restaurant->user_id) {
                Notification::create([
                    'user_id' => $delivery->order->restaurant->user_id,
                    'type' => 'rider_assigned',
                    'title' => 'Rider Assigned',
                    'message' => "Rider {$rider->name} has been assigned to order #{$delivery->order->id}",
                    'data' => json_encode([
                        'order_id' => $delivery->order->id,
                        'rider_name' => $rider->name,
                        'rider_phone' => $rider->phone,
                    ]),
                    'read_at' => null,
                ]);
            }

            // Notify customer
            if ($delivery->order->user_id) {
                Notification::create([
                    'user_id' => $delivery->order->user_id,
                    'type' => 'rider_assigned',
                    'title' => 'Rider on the Way',
                    'message' => "Your order is being picked up by {$rider->name}",
                    'data' => json_encode([
                        'order_id' => $delivery->order->id,
                        'rider_name' => $rider->name,
                    ]),
                    'read_at' => null,
                ]);
            }

            DB::commit();
            Log::info("Delivery {$delivery->id} accepted by rider {$rider->id}");

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error accepting delivery: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return false;
        }
    }

    /**
     * Handle rider rejecting the delivery
     */
    public function rejectDelivery(Delivery $delivery, User $rider)
    {
        try {
            // Update delivery
            $delivery->update([
                'assignment_status' => 'rejected',
                'rejected_at' => now(),
            ]);

            // Find next available rider
            $this->findAndOfferNextRider($delivery);

            Log::info("Delivery {$delivery->id} rejected by rider {$rider->id}");

            return true;
        } catch (\Exception $e) {
            Log::error("Error rejecting delivery: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Handle offer timeout
     */
    public function handleOfferTimeout(Delivery $delivery)
    {
        try {
            // Update delivery
            $delivery->update([
                'assignment_status' => 'expired',
            ]);

            // Find next available rider
            $this->findAndOfferNextRider($delivery);

            Log::info("Delivery offer {$delivery->id} expired");

            return true;
        } catch (\Exception $e) {
            Log::error("Error handling offer timeout: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Find and offer to next available rider
     */
    protected function findAndOfferNextRider(Delivery $delivery)
    {
        // Check if we've exceeded max attempts
        if ($delivery->offer_count >= self::MAX_OFFER_ATTEMPTS) {
            Log::warning("Max offer attempts reached for delivery {$delivery->id}");
            
            // Notify restaurant that no rider is available
            Notification::create([
                'user_id' => $delivery->order->restaurant->user_id,
                'type' => 'no_rider_available',
                'title' => 'No Rider Available',
                'message' => "Unable to find a rider for order #{$delivery->order->id}",
                'data' => json_encode(['order_id' => $delivery->order->id]),
            ]);
            
            return false;
        }

        // Get restaurant location
        $restaurant = $delivery->order->restaurant;
        
        // Find available riders (excluding those who already rejected)
        $riders = $this->findAvailableRiders(
            $restaurant->latitude,
            $restaurant->longitude
        );

        // Filter out riders who already received this offer
        $previousRiderId = $delivery->rider_id;
        $nextRider = $riders->where('id', '!=', $previousRiderId)->first();

        if ($nextRider) {
            $this->sendOfferToRider($delivery->order, $delivery, $nextRider);
            return true;
        }

        return false;
    }

    /**
     * Calculate delivery fee based on distance
     */
    protected function calculateDeliveryFee(Order $order)
    {
        // Base fee
        $baseFee = 30;
        
        // Calculate distance
        $distance = $this->calculateDistance(
            $order->restaurant->latitude,
            $order->restaurant->longitude,
            $order->user->latitude ?? 0,
            $order->user->longitude ?? 0
        );

        // Additional fee per km
        $perKmFee = 10;
        $distanceFee = $distance * $perKmFee;

        return $baseFee + $distanceFee;
    }

    /**
     * Calculate distance between two points (Haversine formula)
     */
    protected function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;

        return round($distance, 2);
    }
}
