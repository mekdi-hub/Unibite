<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Order;
use Illuminate\Http\Request;

class HealthController extends Controller
{
    public function check()
    {
        return response()->json([
            'status' => 'healthy',
            'message' => 'UniBite API is running',
            'version' => app()->version(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function stats()
    {
        return response()->json([
            'message' => 'System statistics',
            'data' => [
                'users' => [
                    'total' => User::count(),
                    'students' => User::where('role', 'student')->count(),
                    'restaurants' => User::where('role', 'restaurant')->count(),
                    'riders' => User::where('role', 'rider')->count(),
                    'admins' => User::where('role', 'admin')->count(),
                ],
                'menu' => [
                    'categories' => Category::count(),
                    'menu_items' => MenuItem::count(),
                    'available_items' => MenuItem::where('is_available', true)->count(),
                ],
                'orders' => [
                    'total' => Order::count(),
                    'pending' => Order::where('status', 'pending')->count(),
                    'delivered' => Order::where('status', 'delivered')->count(),
                    'today' => Order::whereDate('created_at', today())->count(),
                ],
            ]
        ]);
    }
}