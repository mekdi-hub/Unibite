<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Restaurant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Services\NotificationService;

class RestaurantRegistrationController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'restaurantName' => 'required|string|max:255',
            'ownerName' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'address' => 'required|string',
            'openingHours' => 'required|string',
            'description' => 'nullable|string',
            'foodCategories' => 'required',
            'bankAccountName' => 'required|string|max:255',
            'bankAccountNumber' => 'required|string|max:255',
            'bankName' => 'required|string|max:255',
            'businessLicense' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'menuImages.*' => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
        ], [
            'restaurantName.required' => 'Restaurant name is required',
            'ownerName.required' => 'Owner name is required',
            'phone.required' => 'Phone number is required',
            'email.required' => 'Email is required',
            'email.email' => 'Please provide a valid email address',
            'email.unique' => 'This email is already registered',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 8 characters',
            'address.required' => 'Address is required',
            'openingHours.required' => 'Opening hours are required',
            'foodCategories.required' => 'Please select at least one food category',
            'bankAccountName.required' => 'Bank account holder name is required',
            'bankAccountNumber.required' => 'Bank account number is required',
            'bankName.required' => 'Bank name is required',
            'businessLicense.required' => 'Business license is required',
            'businessLicense.mimes' => 'Business license must be a PDF, JPG, or PNG file',
            'businessLicense.max' => 'Business license must not exceed 5MB',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Store business license
            $businessLicensePath = null;
            if ($request->hasFile('businessLicense')) {
                $businessLicensePath = $request->file('businessLicense')->store('business-licenses', 'public');
            }

            // Store menu images
            $menuImagePaths = [];
            if ($request->hasFile('menuImages')) {
                foreach ($request->file('menuImages') as $image) {
                    $menuImagePaths[] = $image->store('menu-images', 'public');
                }
            }

            // Create user account
            $user = User::create([
                'name' => $request->ownerName,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'restaurant',
            ]);

            // Create restaurant
            $restaurant = Restaurant::create([
                'user_id' => $user->id,
                'restaurant_name' => $request->restaurantName,
                'description' => $request->description,
                'address' => $request->address,
                'phone' => $request->phone,
                'opening_time' => '09:00:00', // Default opening time
                'closing_time' => '21:00:00', // Default closing time
                'opening_hours_text' => $request->openingHours, // Store the text version
                'status' => 'pending',
                'business_license' => $businessLicensePath,
                'menu_images' => json_encode($menuImagePaths),
                'food_categories' => $request->foodCategories,
                'bank_account_name' => $request->bankAccountName,
                'bank_account_number' => $request->bankAccountNumber,
                'bank_name' => $request->bankName,
            ]);

            // Notify admins about new restaurant registration
            $notificationService = new NotificationService();
            $notificationService->notifyAdminNewRestaurant($restaurant);

            return response()->json([
                'message' => 'Registration submitted successfully! Please wait for admin approval.',
                'data' => [
                    'user' => $user,
                    'restaurant' => $restaurant
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
