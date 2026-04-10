<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\Restaurant;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        // Create additional restaurant users with approved status
        $restaurantUser3 = User::create([
            'name' => 'Burger Palace Manager',
            'email' => 'burger@unibite.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567897',
            'role' => 'restaurant',
            'status' => 'active',
        ]);

        Restaurant::create([
            'user_id' => $restaurantUser3->id,
            'restaurant_name' => 'Burger Palace',
            'description' => 'Gourmet burgers and crispy fries',
            'address' => 'Student Center, Main Floor',
            'phone' => '+1234567897',
            'opening_time' => '10:00',
            'closing_time' => '23:00',
            'status' => 'approved',
            'delivery_fee' => 2.75,
            'min_order_amount' => 12.00,
        ]);

        $restaurantUser4 = User::create([
            'name' => 'Healthy Bites Manager',
            'email' => 'healthy@unibite.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567898',
            'role' => 'restaurant',
            'status' => 'active',
        ]);

        Restaurant::create([
            'user_id' => $restaurantUser4->id,
            'restaurant_name' => 'Healthy Bites',
            'description' => 'Fresh salads, smoothies, and healthy options',
            'address' => 'Library Building, Ground Floor',
            'phone' => '+1234567898',
            'opening_time' => '08:00',
            'closing_time' => '21:00',
            'status' => 'approved',
            'delivery_fee' => 2.25,
            'min_order_amount' => 8.00,
        ]);
    }

    public function down(): void
    {
        // Remove the restaurants and users created in this migration
        Restaurant::where('restaurant_name', 'Burger Palace')->delete();
        Restaurant::where('restaurant_name', 'Healthy Bites')->delete();
        User::where('email', 'burger@unibite.com')->delete();
        User::where('email', 'healthy@unibite.com')->delete();
    }
};