<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Restaurant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@unibite.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567890',
            'role' => 'admin',
            'status' => 'active',
        ]);

        // Create student users
        $students = [
            [
                'name' => 'John Doe',
                'email' => 'john@student.edu',
                'password' => Hash::make('password'),
                'phone' => '+1234567891',
                'role' => 'student',
                'status' => 'active',
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@student.edu',
                'password' => Hash::make('password'),
                'phone' => '+1234567892',
                'role' => 'student',
                'status' => 'active',
            ],
        ];

        foreach ($students as $studentData) {
            User::create($studentData);
        }

        // Create restaurant users with restaurant profiles
        $restaurantUser1 = User::create([
            'name' => 'Campus Cafe Manager',
            'email' => 'cafe@unibite.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567893',
            'role' => 'restaurant',
            'status' => 'active',
        ]);

        Restaurant::create([
            'user_id' => $restaurantUser1->id,
            'restaurant_name' => 'Campus Cafe',
            'description' => 'Fresh coffee, sandwiches, and light meals',
            'address' => 'Building A, Ground Floor',
            'phone' => '+1234567893',
            'opening_time' => '07:00',
            'closing_time' => '20:00',
            'status' => 'active',
            'delivery_fee' => 2.50,
            'min_order_amount' => 10.00,
        ]);

        $restaurantUser2 = User::create([
            'name' => 'Pizza Corner Manager',
            'email' => 'pizza@unibite.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567894',
            'role' => 'restaurant',
            'status' => 'active',
        ]);

        Restaurant::create([
            'user_id' => $restaurantUser2->id,
            'restaurant_name' => 'Pizza Corner',
            'description' => 'Delicious pizzas and Italian cuisine',
            'address' => 'Food Court, Level 2',
            'phone' => '+1234567894',
            'opening_time' => '11:00',
            'closing_time' => '22:00',
            'status' => 'active',
            'delivery_fee' => 3.00,
            'min_order_amount' => 15.00,
        ]);

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

        // Create rider users
        $riders = [
            [
                'name' => 'Mike Wilson',
                'email' => 'mike@rider.com',
                'password' => Hash::make('password'),
                'phone' => '+1234567895',
                'role' => 'rider',
                'status' => 'active',
            ],
            [
                'name' => 'Sarah Johnson',
                'email' => 'sarah@rider.com',
                'password' => Hash::make('password'),
                'phone' => '+1234567896',
                'role' => 'rider',
                'status' => 'active',
            ],
        ];

        foreach ($riders as $riderData) {
            User::create($riderData);
        }
    }
}