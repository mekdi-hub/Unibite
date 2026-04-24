<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class PasswordResetController extends Controller
{
    /**
     * Send password reset link
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        try {
            $status = Password::sendResetLink(
                $request->only('email')
            );

            Log::info('Password reset link status: ' . $status);

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json([
                    'message' => 'Password reset link sent to your email',
                ], 200);
            }

            return response()->json([
                'message' => 'Unable to send reset link. Please try again.',
            ], 500);
        } catch (\Exception $e) {
            Log::error('Password reset error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while sending the reset link.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset password
     */
    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        try {
            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function (User $user, string $password) {
                    $user->forceFill([
                        'password' => Hash::make($password)
                    ])->setRememberToken(Str::random(60));

                    $user->save();
                }
            );

            Log::info('Password reset status: ' . $status);

            if ($status === Password::PASSWORD_RESET) {
                return response()->json([
                    'message' => 'Password has been reset successfully',
                ], 200);
            }

            return response()->json([
                'message' => 'Unable to reset password. The token may be invalid or expired.',
            ], 400);
        } catch (\Exception $e) {
            Log::error('Password reset error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while resetting the password.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
