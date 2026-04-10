<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DeliveryController extends Controller
{
    public function availableDeliveries(Request $request)
    {
        // Only riders can view available deliveries
        if (!$request->user()->isRider()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $deliveries = Delivery::pending()
            ->with(['order.student', 'order.restaurant', 'order.items.menuItem'])
            ->whereHas('order', function ($query) {
                $query->where('status', 'ready');
            })
            ->get();

        // Format the response to match frontend expectations
        $formattedDeliveries = $deliveries->map(function ($delivery) {
            return [
                'id' => $delivery->id,
                'order_id' => $delivery->order_id,
                'restaurant' => [
                    'name' => $delivery->order->restaurant->restaurant_name ?? 'Unknown',
                    'address' => $delivery->order->restaurant->address ?? 'N/A',
                    'phone' => $delivery->order->restaurant->phone ?? 'N/A',
                ],
                'customer' => [
                    'name' => $delivery->order->student->name ?? 'Unknown',
                    'address' => $delivery->order->delivery_address ?? 'N/A',
                    'phone' => $delivery->order->student->phone ?? 'N/A',
                ],
                'payment_status' => $delivery->order->payment_status === 'paid' ? 'paid' : 'cash',
                'amount' => (float) $delivery->order->total_amount,
                'delivery_fee' => 15, // Default delivery fee
                'distance' => 2.0, // Calculate or default
                'estimated_time' => 15, // Calculate or default
                'created_at' => $delivery->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Available deliveries retrieved successfully',
            'data' => $formattedDeliveries
        ]);
    }

    public function acceptDelivery(Request $request, $deliveryId)
    {
        // Only riders can accept deliveries
        if (!$request->user()->isRider()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Find the delivery
        $delivery = Delivery::find($deliveryId);
        
        if (!$delivery) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery not found'
            ], 404);
        }

        if (!$delivery->isPending()) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery is no longer available'
            ], 400);
        }

        $delivery->assignToRider($request->user()->id);
        $delivery->order->update(['status' => 'out_for_delivery']);

        $delivery->load(['order.student', 'order.restaurant', 'rider']);

        return response()->json([
            'success' => true,
            'message' => 'Delivery accepted successfully',
            'data' => $delivery
        ]);
    }

    public function updateStatus(Request $request, $deliveryId)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:assigned,picked_up,delivered',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find the delivery
        $delivery = Delivery::find($deliveryId);
        
        if (!$delivery) {
            return response()->json([
                'success' => false,
                'message' => 'Delivery not found'
            ], 404);
        }

        // Only assigned rider can update delivery status
        if (!$request->user()->isRider() || $delivery->rider_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - This delivery is not assigned to you'
            ], 403);
        }

        if ($request->status === 'picked_up') {
            $delivery->markAsPickedUp();
        } elseif ($request->status === 'delivered') {
            $delivery->markAsDelivered();
            $delivery->order->update(['status' => 'delivered']);
        }

        if ($request->has('notes')) {
            $delivery->update(['notes' => $request->notes]);
        }

        $delivery->load(['order.student', 'order.restaurant', 'order.items.menuItem']);

        // Format the response to match frontend expectations
        $formattedDelivery = [
            'id' => $delivery->id,
            'order_id' => $delivery->order_id,
            'status' => $delivery->status,
            'assignment_status' => $delivery->assignment_status,
            'restaurant' => [
                'name' => $delivery->order->restaurant->restaurant_name ?? 'Unknown',
                'address' => $delivery->order->restaurant->address ?? 'N/A',
                'phone' => $delivery->order->restaurant->phone ?? 'N/A',
            ],
            'customer' => [
                'name' => $delivery->order->student->name ?? 'Unknown',
                'address' => $delivery->order->delivery_address ?? $delivery->order->student->address ?? 'N/A',
                'phone' => $delivery->order->student->phone ?? 'N/A',
            ],
            'payment_status' => $delivery->order->payment_status,
            'total_amount' => (float) $delivery->order->total_amount,
            'delivery_fee' => (float) ($delivery->order->restaurant->delivery_fee ?? 15),
            'items' => $delivery->order->items->map(function ($item) {
                return [
                    'name' => $item->menuItem->name ?? 'Unknown',
                    'quantity' => $item->quantity,
                    'price' => (float) $item->price,
                ];
            }),
            'accepted_at' => $delivery->accepted_at,
            'pickup_time' => $delivery->pickup_time,
            'delivery_time' => $delivery->delivery_time,
        ];

        return response()->json([
            'success' => true,
            'message' => 'Delivery status updated successfully',
            'data' => $formattedDelivery
        ]);
    }

    public function riderDeliveries(Request $request)
    {
        // Only riders can view their deliveries
        if (!$request->user()->isRider()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $deliveries = Delivery::where('rider_id', $request->user()->id)
            ->with(['order.student', 'order.restaurant', 'order.items.menuItem'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'message' => 'Rider deliveries retrieved successfully',
            'data' => $deliveries
        ]);
    }
}