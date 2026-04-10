<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\Delivery;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\RestaurantApproved;
use App\Services\NotificationService;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getDashboardStats()
    {
        $totalStudents = User::where('role', 'student')->count();
        $totalRestaurants = User::where('role', 'restaurant')->count();
        $totalRiders = User::where('role', 'rider')->count();
        $totalOrders = Order::count();
        $ordersToday = Order::whereDate('created_at', today())->count();
        $totalRevenue = Order::where('status', 'delivered')->sum('total_amount');
        $pendingOrders = Order::where('status', 'pending')->count();
        $activeUsers = User::where('status', 'active')->count();

        // Orders per day (last 7 days)
        $ordersPerDay = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subDays(7))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        // Revenue per day (last 7 days)
        $revenuePerDay = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('SUM(total_amount) as revenue')
        )
        ->where('created_at', '>=', now()->subDays(7))
        ->where('status', 'delivered')
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        // Most ordered menu items
        $mostOrderedItems = DB::table('order_items')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->select('menu_items.name', 'menu_items.image', DB::raw('SUM(order_items.quantity) as total_orders'))
            ->groupBy('menu_items.id', 'menu_items.name', 'menu_items.image')
            ->orderByDesc('total_orders')
            ->limit(5)
            ->get();

        // Recent orders
        $recentOrders = Order::with(['student', 'restaurant'])
            ->latest()
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => [
                    'totalStudents' => $totalStudents,
                    'totalRestaurants' => $totalRestaurants,
                    'totalRiders' => $totalRiders,
                    'totalOrders' => $totalOrders,
                    'ordersToday' => $ordersToday,
                    'totalRevenue' => $totalRevenue,
                    'pendingOrders' => $pendingOrders,
                    'activeUsers' => $activeUsers,
                ],
                'ordersPerDay' => $ordersPerDay,
                'revenuePerDay' => $revenuePerDay,
                'mostOrderedItems' => $mostOrderedItems,
                'recentOrders' => $recentOrders,
            ]
        ]);
    }

    /**
     * Get all users
     */
    public function getUsers(Request $request)
    {
        $query = User::query();

        // Filter by role
        if ($request->has('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->withCount('studentOrders')->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Create new user (employee)
     */
    public function createUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8',
            'role' => 'required|in:rider,admin,restaurant'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => bcrypt($request->password),
            'role' => $request->role,
            'status' => 'active'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Employee created successfully',
            'data' => $user
        ], 201);
    }

    /**
     * Update user status
     */
    public function updateUserStatus(Request $request, User $user)
    {
        $request->validate([
            'status' => 'required|in:active,inactive'
        ]);

        $user->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'User status updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Delete user
     */
    public function deleteUser(User $user)
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Get pending restaurant registrations
     */
    public function getPendingRestaurants()
    {
        $pendingRestaurants = Restaurant::with('user')
            ->where('status', 'pending')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pendingRestaurants
        ]);
    }

    /**
     * Approve restaurant registration
     */
    public function approveRestaurant(Restaurant $restaurant)
    {
        $restaurant->update(['status' => 'approved']);

        // Send approval notification using NotificationService
        $notificationService = new NotificationService();
        $notificationService->sendRestaurantApprovalNotification($restaurant);

        return response()->json([
            'success' => true,
            'message' => 'Restaurant approved successfully and notification email sent',
            'data' => $restaurant
        ]);
    }

    /**
     * Reject restaurant registration
     */
    public function rejectRestaurant(Restaurant $restaurant)
    {
        $restaurant->update(['status' => 'suspended']);

        // Send rejection notification using NotificationService
        $notificationService = new NotificationService();
        $notificationService->sendRestaurantRejectionNotification($restaurant, 'Your application did not meet our requirements.');

        return response()->json([
            'success' => true,
            'message' => 'Restaurant rejected',
            'data' => $restaurant
        ]);
    }

    /**
     * Get all restaurants with filters
     */
    public function getRestaurants(Request $request)
    {
        $query = Restaurant::with('user');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('restaurant_name', 'like', "%{$search}%");
        }

        $restaurants = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $restaurants
        ]);
    }

    /**
     * Get all orders (for admin)
     */
    public function getAllOrders(Request $request)
    {
        $query = Order::with(['student', 'restaurant', 'items.menuItem']);

        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by order ID or student name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('student', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
}
