<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RestaurantController extends Controller
{
    public function index()
    {
        $restaurants = Restaurant::whereIn('status', ['active', 'approved'])
            ->with(['user', 'menuItems.category'])
            ->get();

        return response()->json([
            'message' => 'Restaurants retrieved successfully',
            'data' => $restaurants
        ]);
    }

    public function show(Restaurant $restaurant)
    {
        $restaurant->load(['user', 'menuItems.category']);

        return response()->json([
            'message' => 'Restaurant retrieved successfully',
            'data' => $restaurant
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'restaurant_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string',
            'phone' => 'required|string|max:20',
            'image' => 'nullable|string|max:255',
            'opening_time' => 'required|date_format:H:i',
            'closing_time' => 'required|date_format:H:i|after:opening_time',
            'delivery_fee' => 'required|numeric|min:0',
            'min_order_amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user has restaurant role
        $user = User::find($request->user_id);
        if (!$user->isRestaurant()) {
            return response()->json([
                'message' => 'User must have restaurant role'
            ], 400);
        }

        // Check if user already has a restaurant
        if ($user->restaurant) {
            return response()->json([
                'message' => 'User already has a restaurant profile'
            ], 400);
        }

        $restaurant = Restaurant::create($request->all());
        $restaurant->load(['user']);

        return response()->json([
            'message' => 'Restaurant created successfully',
            'data' => $restaurant
        ], 201);
    }

    public function update(Request $request, Restaurant $restaurant)
    {
        $validator = Validator::make($request->all(), [
            'restaurant_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string',
            'phone' => 'required|string|max:20',
            'image' => 'nullable|string|max:255',
            'opening_time' => 'required|date_format:H:i',
            'closing_time' => 'required|date_format:H:i|after:opening_time',
            'delivery_fee' => 'required|numeric|min:0',
            'min_order_amount' => 'required|numeric|min:0',
            'status' => 'in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user owns this restaurant
        if ($request->user()->role === 'restaurant' && $restaurant->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized to update this restaurant'
            ], 403);
        }

        $restaurant->update($request->all());
        $restaurant->load(['user']);

        return response()->json([
            'message' => 'Restaurant updated successfully',
            'data' => $restaurant
        ]);
    }

    public function destroy(Restaurant $restaurant)
    {
        $restaurant->delete();

        return response()->json([
            'message' => 'Restaurant deleted successfully'
        ]);
    }

    public function myRestaurant(Request $request)
    {
        if (!$request->user()->isRestaurant()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $restaurant = $request->user()->restaurant;

        if (!$restaurant) {
            return response()->json([
                'message' => 'No restaurant profile found'
            ], 404);
        }

        $restaurant->load(['menuItems.category', 'orders.student']);

        return response()->json([
            'message' => 'Restaurant profile retrieved successfully',
            'data' => $restaurant
        ]);
    }

    public function getMenuItems(Restaurant $restaurant)
    {
        $menuItems = $restaurant->menuItems()
            ->with('category')
            ->where('is_available', true)
            ->get();

        return response()->json([
            'message' => 'Menu items retrieved successfully',
            'data' => $menuItems
        ]);
    }
}