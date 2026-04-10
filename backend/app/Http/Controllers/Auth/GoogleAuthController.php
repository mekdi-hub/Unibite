<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->stateless()
            ->scopes(['openid', 'profile', 'email'])
            ->redirect();
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback()
    {
        try {
            \Log::info('Google OAuth callback initiated');
            
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            \Log::info('Google user retrieved', [
                'email' => $googleUser->email,
                'name' => $googleUser->name,
                'google_id' => $googleUser->id
            ]);
            
            // Find or create user
            $user = User::where('email', $googleUser->email)->first();
            
            if (!$user) {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'password' => bcrypt(Str::random(16)), // Random password
                    'phone' => '', // Will be updated later
                    'role' => 'student', // Default role
                    'status' => 'active',
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                ]);
                \Log::info('New user created via Google OAuth', ['user_id' => $user->id]);
            } else {
                // Update existing user with Google info
                $user->update([
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                ]);
                \Log::info('Existing user updated via Google OAuth', ['user_id' => $user->id]);
            }

            // Create token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect to frontend with token
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            \Log::info('Redirecting to frontend', ['url' => $frontendUrl]);
            
            return redirect()->away("{$frontendUrl}/auth/google/callback?token={$token}&user=" . urlencode(json_encode($user)));

        } catch (\Exception $e) {
            \Log::error('Google OAuth error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            return redirect()->away("{$frontendUrl}/login?error=google_auth_failed&message=" . urlencode($e->getMessage()));
        }
    }
}
