<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MenuItemController extends Controller
{
    public function index(Request $request)
    {
        $query = MenuItem::with(['category', 'restaurant']);

        // Filter by category
        if ($request->has('category_id')) {
            $query->byCategory($request->category_id);
        }

        // Filter by restaurant
        if ($request->has('restaurant_id')) {
            $query->byRestaurant($request->restaurant_id);
        }

        // Filter by availability
        if ($request->has('available') && $request->available) {
            $query->available();
        }

        $menuItems = $query->get();

        return response()->json([
            'message' => 'Menu items retrieved successfully',
            'data' => $menuItems
        ]);
    }

    public function show(MenuItem $menuItem)
    {
        $menuItem->load(['category', 'restaurant']);

        return response()->json([
            'message' => 'Menu item retrieved successfully',
            'data' => $menuItem
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'restaurant_id' => 'required|exists:restaurants,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string|max:255',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user owns the restaurant
        if ($request->user()->role === 'restaurant') {
            $restaurant = $request->user()->restaurant;
            if (!$restaurant || $restaurant->id != $request->restaurant_id) {
                return response()->json([
                    'message' => 'Unauthorized to create menu items for this restaurant'
                ], 403);
            }
        }

        $menuItem = MenuItem::create($request->all());
        $menuItem->load(['category', 'restaurant']);

        return response()->json([
            'message' => 'Menu item created successfully',
            'data' => $menuItem
        ], 201);
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string|max:255',
            'is_available' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user owns the restaurant
        if ($request->user()->role === 'restaurant') {
            $restaurant = $request->user()->restaurant;
            if (!$restaurant || $restaurant->id != $menuItem->restaurant_id) {
                return response()->json([
                    'message' => 'Unauthorized to update this menu item'
                ], 403);
            }
        }

        $menuItem->update($request->all());
        $menuItem->load(['category', 'restaurant']);

        return response()->json([
            'message' => 'Menu item updated successfully',
            'data' => $menuItem
        ]);
    }

    public function destroy(Request $request, MenuItem $menuItem)
    {
        // Check if user owns the restaurant
        if ($request->user()->role === 'restaurant') {
            $restaurant = $request->user()->restaurant;
            if (!$restaurant || $restaurant->id != $menuItem->restaurant_id) {
                return response()->json([
                    'message' => 'Unauthorized to delete this menu item'
                ], 403);
            }
        }

        $menuItem->delete();

        return response()->json([
            'message' => 'Menu item deleted successfully'
        ]);
    }
}