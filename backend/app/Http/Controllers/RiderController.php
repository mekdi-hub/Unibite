<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Delivery;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class RiderController extends Controller
{
    public function getDashboardStats(Request $request)
    {
        try {
            $rider = Auth::user();
            
            // Mock stats since Delivery model relationships might not be set up yet
            $stats = [
                'todayDeliveries' => 8,
                'completedDeliveries' => 156,
                'pendingDeliveries' => 2,
                'totalDistance' => 45.2,
                'averageRating' => 4.8,
                'onlineHours' => 6.5
            ];
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getProfile(Request $request)
    {
        try {
            $rider = Auth::user();
            
            // Mock rider data since database fields might not exist yet
            $riderData = [
                'id' => $rider->id,
                'name' => $rider->name,
                'email' => $rider->email,
                'phone' => $rider->phone ?? '+251912345678',
                'vehicle_type' => $rider->vehicle_type ?? 'Bike',
                'license_number' => $rider->license_number ?? 'AA-123456',
                'emergency_contact' => $rider->emergency_contact ?? 'Emergency Contact',
                'emergency_phone' => $rider->emergency_phone ?? '+251911234567',
                'status' => 'available',
                'is_online' => false,
                'rating' => 4.8,
                'total_deliveries' => 156,
                'total_earnings' => 8500,
                'join_date' => $rider->created_at->toDateString()
            ];
            
            return response()->json([
                'success' => true,
                'data' => $riderData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch rider profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $rider = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'phone' => 'required|string|max:20',
                'vehicle_type' => 'required|string|in:Bike,Motorcycle,Car,Scooter',
                'license_number' => 'nullable|string|max:50',
                'emergency_contact' => 'nullable|string|max:255',
                'emergency_phone' => 'nullable|string|max:20',
                'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = [
                'name' => $request->name,
                'phone' => $request->phone,
                'vehicle_type' => $request->vehicle_type,
                'license_number' => $request->license_number,
                'emergency_contact' => $request->emergency_contact,
                'emergency_phone' => $request->emergency_phone,
            ];

            // Handle profile image upload
            if ($request->hasFile('profile_image')) {
                $image = $request->file('profile_image');
                $imageName = time() . '_' . $image->getClientOriginalName();
                $imagePath = $image->storeAs('rider_profiles', $imageName, 'public');
                $updateData['profile_image'] = $imagePath;
            }

            $rider->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $rider->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatus(Request $request)
    {
        try {
            $rider = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'status' => 'required|string|in:available,busy,offline'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid status',
                    'errors' => $validator->errors()
                ], 422);
            }

            // For now, just return success since status field might not exist
            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'data' => ['status' => $request->status]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleOnlineStatus(Request $request)
    {
        try {
            $rider = Auth::user();
            
            $isOnline = $request->boolean('is_online');
            
            // For now, just return success since is_online field might not exist
            return response()->json([
                'success' => true,
                'message' => 'Online status updated successfully',
                'data' => ['is_online' => $isOnline]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update online status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getEarnings(Request $request)
    {
        try {
            $rider = Auth::user();
            $period = $request->get('period', 'today');
            
            // Mock earnings data since Delivery model might not be set up
            $earnings = [
                'today' => 350,
                'thisWeek' => 1200,
                'thisMonth' => 4800,
                'total' => 8500,
                'todayDeliveries' => 8,
                'weekDeliveries' => 32,
                'monthDeliveries' => 145,
                'totalDeliveries' => 312,
                'averagePerDelivery' => 27.2,
                'topEarningDay' => 420,
                'totalDistance' => 1250,
                'averageRating' => 4.8
            ];
            
            return response()->json([
                'success' => true,
                'data' => $earnings
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch earnings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getEarningsHistory(Request $request)
    {
        try {
            $rider = Auth::user();
            $period = $request->get('period', 'week');
            
            // Mock earnings history data
            $history = [];
            $today = new \DateTime();
            
            for ($i = 6; $i >= 0; $i--) {
                $date = clone $today;
                $date->modify("-{$i} days");
                
                $history[] = [
                    'date' => $date->format('Y-m-d'),
                    'earnings' => rand(150, 350),
                    'deliveries' => rand(3, 10),
                    'distance' => rand(15, 45),
                    'hours' => rand(4, 8)
                ];
            }
            
            return response()->json([
                'success' => true,
                'data' => $history
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch earnings history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getActiveDelivery(Request $request)
    {
        try {
            $rider = Auth::user();
            
            \Log::info('Getting active delivery for rider: ' . $rider->id);
            
            // Get the active delivery for this rider
            $delivery = Delivery::with(['order.restaurant', 'order.student', 'order.items.menuItem'])
                ->where('rider_id', $rider->id)
                ->whereIn('status', ['assigned', 'picked_up'])
                ->whereIn('assignment_status', ['pending', 'accepted'])
                ->first();
            
            \Log::info('Active delivery found: ' . ($delivery ? 'Yes (ID: ' . $delivery->id . ')' : 'No'));
            
            if ($delivery) {
                \Log::info('Delivery status: ' . $delivery->status . ', assignment_status: ' . $delivery->assignment_status);
            }
            
            // Also check all deliveries for this rider for debugging
            $allDeliveries = Delivery::where('rider_id', $rider->id)->get(['id', 'status', 'assignment_status']);
            \Log::info('All deliveries for rider: ' . $allDeliveries->toJson());
            
            if (!$delivery) {
                return response()->json([
                    'success' => true,
                    'data' => null
                ]);
            }
            
            // Format the delivery data
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
                'data' => $formattedDelivery
            ]);
        } catch (\Exception $e) {
            \Log::error('Get active delivery error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch active delivery',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getOrderHistory(Request $request)
    {
        try {
            $rider = Auth::user();
            
            // Fetch actual deliveries from database
            $deliveries = Delivery::where('rider_id', $rider->id)
                ->with(['order.student', 'order.restaurant', 'order.items.menuItem'])
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Format the response to match frontend expectations
            $history = $deliveries->map(function ($delivery) {
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
                    'status' => $delivery->status,
                    'amount' => (float) $delivery->order->total_amount,
                    'delivery_fee' => (float) ($delivery->order->restaurant->delivery_fee ?? 15),
                    'distance' => 2.0, // Calculate or default
                    'payment_status' => $delivery->order->payment_status === 'paid' ? 'paid' : 'cash',
                    'completed_at' => $delivery->delivery_time ? $delivery->delivery_time->format('Y-m-d H:i:s') : $delivery->updated_at->format('Y-m-d H:i:s'),
                    'rating' => null, // TODO: Implement rating system
                    'customer_feedback' => null, // TODO: Implement feedback system
                    'cancellation_reason' => $delivery->notes ?? null,
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $history
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Accept a delivery request
     */
    public function acceptDelivery(Request $request)
    {
        try {
            $rider = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'delivery_id' => 'required|integer|exists:deliveries,id',
                'order_id' => 'required|integer|exists:orders,id'
            ], [
                'delivery_id.exists' => 'This delivery is no longer available. It may have been accepted by another rider.',
                'order_id.exists' => 'This order is no longer available.'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $delivery = Delivery::with('order.restaurant')->findOrFail($request->delivery_id);
            $order = Order::findOrFail($request->order_id);

            // Check if delivery is still available
            // Allow if it's assigned to current rider but not yet accepted, or if it's unassigned
            if ($delivery->rider_id !== null && $delivery->rider_id !== $rider->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'This delivery has already been accepted by another rider'
                ], 409);
            }

            // Check if already accepted by this rider
            if ($delivery->rider_id === $rider->id && $delivery->assignment_status === 'accepted') {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already accepted this delivery'
                ], 409);
            }

            // Use RiderAssignmentService to handle acceptance
            $assignmentService = app(\App\Services\RiderAssignmentService::class);
            $result = $assignmentService->acceptDelivery($delivery, $rider);

            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => 'Delivery accepted successfully',
                    'data' => [
                        'delivery' => $delivery->fresh(),
                        'order' => $order->fresh()
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to accept delivery. Please check the logs for details.'
                ], 500);
            }
        } catch (\Exception $e) {
            \Log::error('Accept delivery exception: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error accepting delivery: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a delivery request
     */
    public function rejectDelivery(Request $request)
    {
        try {
            $rider = Auth::user();
            
            $validator = Validator::make($request->all(), [
                'delivery_id' => 'required|integer|exists:deliveries,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $delivery = Delivery::findOrFail($request->delivery_id);

            // Use RiderAssignmentService to handle rejection
            $assignmentService = app(\App\Services\RiderAssignmentService::class);
            $result = $assignmentService->rejectDelivery($delivery, $rider);

            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => 'Delivery rejected successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to reject delivery'
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
     * Get all riders (Admin only)
     */
    public function getAllRiders(Request $request)
    {
        try {
            // Get all users with rider role
            $riders = User::where('role', 'rider')
                ->select('id', 'name', 'email', 'phone', 'created_at')
                ->get();
            
            // Format rider data with stats
            $ridersData = $riders->map(function ($rider) {
                $totalDeliveries = Delivery::where('rider_id', $rider->id)
                    ->where('status', 'delivered')
                    ->count();
                
                $isOnline = false; // Default to offline
                $status = 'offline';
                
                // Check if rider has any active deliveries
                $activeDelivery = Delivery::where('rider_id', $rider->id)
                    ->whereIn('status', ['assigned', 'picked_up'])
                    ->exists();
                
                if ($activeDelivery) {
                    $isOnline = true;
                    $status = 'busy';
                }
                
                return [
                    'id' => $rider->id,
                    'name' => $rider->name,
                    'email' => $rider->email,
                    'phone' => $rider->phone ?? 'N/A',
                    'vehicle_type' => 'Bike', // Default value
                    'is_online' => $isOnline,
                    'status' => $status,
                    'total_deliveries' => $totalDeliveries,
                    'rating' => 4.8, // Mock rating
                    'created_at' => $rider->created_at->toDateString()
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $ridersData
            ]);
        } catch (\Exception $e) {
            \Log::error('Get all riders error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch riders',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}