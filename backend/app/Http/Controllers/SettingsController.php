<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    /**
     * Get application settings
     */
    public function index()
    {
        // Get settings from cache or use defaults
        $settings = Cache::get('app_settings', [
            'siteName' => 'UniBite',
            'email' => 'support@unibite.com',
            'phone' => '+251-XXX-XXXX',
            'address' => 'Campus Area',
            'currency' => 'ETB',
            'currencySymbol' => 'Br',
            'deliveryFee' => 15,
            'minOrder' => 50,
            'taxRate' => 0,
            'notifications' => true,
            'emailNotifications' => true,
            'smsNotifications' => false,
        ]);

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
     * Update application settings
     */
    public function update(Request $request)
    {
        // Only admins can update settings
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admins can update settings.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'siteName' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'currency' => 'nullable|string|in:ETB,USD',
            'currencySymbol' => 'nullable|string|max:10',
            'deliveryFee' => 'nullable|numeric|min:0',
            'minOrder' => 'nullable|numeric|min:0',
            'taxRate' => 'nullable|numeric|min:0|max:100',
            'notifications' => 'nullable|boolean',
            'emailNotifications' => 'nullable|boolean',
            'smsNotifications' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Get current settings
        $settings = Cache::get('app_settings', []);

        // Update with new values
        $newSettings = array_merge($settings, $request->only([
            'siteName',
            'email',
            'phone',
            'address',
            'currency',
            'currencySymbol',
            'deliveryFee',
            'minOrder',
            'taxRate',
            'notifications',
            'emailNotifications',
            'smsNotifications',
        ]));

        // Save to cache (you can also save to database if needed)
        Cache::forever('app_settings', $newSettings);

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
            'data' => $newSettings
        ]);
    }
}
