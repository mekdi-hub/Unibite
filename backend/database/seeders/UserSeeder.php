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
        $admin = User::firstOrCreate(
            ['email' => 'admin@unibite.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'phone' => '+1234567890',
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // Create student users
        $students = [
            [
                'email' => 'john@student.edu',
                'name' => 'John Doe',
                'password' => Hash::make('password'),
                'phone' => '+1234567891',
                'role' => 'student',
                'status' => 'active',
            ],
            [
                'email' => 'jane@student.edu',
                'name' => 'Jane Smith',
                'password' => Hash::make('password'),
                'phone' => '+1234567892',
                'role' => 'student',
                'status' => 'active',
            ],
        ];

        foreach ($students as $studentData) {
            $email = $studentData['email'];
            unset($studentData['email']);
            User::firstOrCreate(['email' => $email], $studentData);
        }

        // Create restaurant users with restaurant profiles
        $restaurantUser1 = User::firstOrCreate(
            ['email' => 'cafe@unibite.com'],
            [
                'name' => 'Campus Cafe Manager',
                'password' => Hash::make('password'),
                'phone' => '+1234567893',
                'role' => 'restaurant',
                'status' => 'active',
            ]
        );

        Restaurant::firstOrCreate(
            ['user_id' => $restaurantUser1->id],
            [
                'restaurant_name' => 'Campus Cafe',
                'description' => 'Fresh coffee, sandwiches, and light meals',
                'address' => 'Building A, Ground Floor',
                'phone' => '+1234567893',
                'opening_time' => '07:00',
                'closing_time' => '20:00',
                'status' => 'active',
                'delivery_fee' => 2.50,
                'min_order_amount' => 10.00,
            ]
        );

        $restaurantUser2 = User::firstOrCreate(
            ['email' => 'pizza@unibite.com'],
            [
                'name' => 'Pizza Corner Manager',
                'password' => Hash::make('password'),
                'phone' => '+1234567894',
                'role' => 'restaurant',
                'status' => 'active',
            ]
        );

        Restaurant::firstOrCreate(
            ['user_id' => $restaurantUser2->id],
            [
                'restaurant_name' => 'Pizza Corner',
                'description' => 'Delicious pizzas and Italian cuisine',
                'address' => 'Food Court, Level 2',
                'phone' => '+1234567894',
                'opening_time' => '11:00',
                'closing_time' => '22:00',
                'status' => 'active',
                'delivery_fee' => 3.00,
                'min_order_amount' => 15.00,
            ]
        );

        // Create additional restaurant users with approved status
        $restaurantUser3 = User::firstOrCreate(
            ['email' => 'burger@unibite.com'],
            [
                'name' => 'Burger Palace Manager',
                'password' => Hash::make('password'),
                'phone' => '+1234567897',
                'role' => 'restaurant',
                'status' => 'active',
            ]
        );

        Restaurant::firstOrCreate(
            ['user_id' => $restaurantUser3->id],
            [
                'restaurant_name' => 'Burger Palace',
                'description' => 'Gourmet burgers and crispy fries',
                'address' => 'Student Center, Main Floor',
                'phone' => '+1234567897',
                'opening_time' => '10:00',
                'closing_time' => '23:00',
                'status' => 'approved',
                'delivery_fee' => 2.75,
                'min_order_amount' => 12.00,
            ]
        );

        $restaurantUser4 = User::firstOrCreate(
            ['email' => 'healthy@unibite.com'],
            [
                'name' => 'Healthy Bites Manager',
                'password' => Hash::make('password'),
                'phone' => '+1234567898',
                'role' => 'restaurant',
                'status' => 'active',
            ]
        );

        Restaurant::firstOrCreate(
            ['user_id' => $restaurantUser4->id],
            [
                'restaurant_name' => 'Healthy Bites',
                'description' => 'Fresh salads, smoothies, and healthy options',
                'address' => 'Library Building, Ground Floor',
                'phone' => '+1234567898',
                'opening_time' => '08:00',
                'closing_time' => '21:00',
                'status' => 'approved',
                'delivery_fee' => 2.25,
                'min_order_amount' => 8.00,
            ]
        );

        // Create rider users
        $riders = [
            [
                'email' => 'mike@rider.com',
                'name' => 'Mike Wilson',
                'password' => Hash::make('password'),
                'phone' => '+1234567895',
                'role' => 'rider',
                'status' => 'active',
            ],
            [
                'email' => 'sarah@rider.com',
                'name' => 'Sarah Johnson',
                'password' => Hash::make('password'),
                'phone' => '+1234567896',
                'role' => 'rider',
                'status' => 'active',
            ],
        ];

        foreach ($riders as $riderData) {
            $email = $riderData['email'];
            unset($riderData['email']);
            User::firstOrCreate(['email' => $email], $riderData);
        }
    }
}