<?php
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\RestaurantRegistrationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RestaurantDashboardController;
use App\Http\Controllers\RiderController;
use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Broadcast;

// Broadcasting routes
Broadcast::routes(['middleware' => ['auth:sanctum']]);
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public routes
Route::get('/', [HealthController::class, 'check']);
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working',
        'timestamp' => now(),
        'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected'
    ]);
});

Route::get('/health', [HealthController::class, 'check']);
Route::get('/stats', [HealthController::class, 'stats']);

// Contact form
Route::post('/contact', [ContactController::class, 'submit']);

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum');
    
    // Google OAuth
    Route::get('/google', [GoogleAuthController::class, 'redirectToGoogle']);
    Route::get('/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
    
    // Password Reset
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
    Route::post('/reset-password', [PasswordResetController::class, 'reset']);
});

// Public data routes (no authentication required)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);
Route::get('/restaurants', [RestaurantController::class, 'index']);
Route::get('/restaurants/{restaurant}', [RestaurantController::class, 'show']);
Route::get('/restaurants/{restaurant}/menu-items', [RestaurantController::class, 'getMenuItems']);
Route::get('/menu-items', [MenuItemController::class, 'index']);
Route::get('/menu-items/{menuItem}', [MenuItemController::class, 'show']);

// Settings (public read, protected write)
Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'index']);

// Restaurant registration (public)
Route::post('/restaurant/register', [RestaurantRegistrationController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // User profile
    Route::get('/profile', function (Request $request) {
        $user = $request->user();
        $user->load(['restaurant', 'notifications']);
        return response()->json(['data' => $user]);
    });

    // Categories (Admin only for CUD operations)
    Route::middleware('role:admin')->group(function () {
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    });

    // Menu Items (Restaurant owners can manage their own)
    Route::post('/menu-items', [MenuItemController::class, 'store']);
    Route::put('/menu-items/{menuItem}', [MenuItemController::class, 'update']);
    Route::delete('/menu-items/{menuItem}', [MenuItemController::class, 'destroy']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']); // Only for cash on delivery
    Route::post('/orders/checkout', [OrderController::class, 'initializeCheckout']); // For pre-payment
    Route::get('/orders/checkout-from-txref/{txRef}', [OrderController::class, 'getCheckoutIdFromTxRef']); // Get checkout_id from tx_ref
    Route::post('/orders/create-after-payment', [OrderController::class, 'createOrderAfterPayment']); // Create order after payment
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus']);
    Route::put('/orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
    
    // Restaurant: Mark order as ready and assign to riders
    Route::post('/orders/{order}/mark-ready', [OrderController::class, 'markAsReady']);
    
    // Rider: Delivery requests and actions
    Route::get('/rider/delivery-requests', [OrderController::class, 'getPendingDeliveryRequests']);
    Route::post('/deliveries/{delivery}/accept', [OrderController::class, 'acceptDelivery']);
    Route::post('/deliveries/{delivery}/reject', [OrderController::class, 'rejectDelivery']);
    Route::post('/rider/update-location', [OrderController::class, 'updateRiderLocation']);
    Route::post('/rider/toggle-status', [OrderController::class, 'toggleRiderStatus']);

    // Restaurants
    Route::get('/my-restaurant', [RestaurantController::class, 'myRestaurant']);
    Route::post('/restaurants', [RestaurantController::class, 'store']);
    Route::put('/restaurants/{restaurant}', [RestaurantController::class, 'update']);
    Route::delete('/restaurants/{restaurant}', [RestaurantController::class, 'destroy']);

    // Deliveries (Rider specific)
    Route::get('/deliveries/available', [DeliveryController::class, 'availableDeliveries']);
    Route::post('/deliveries/{delivery}/accept', [DeliveryController::class, 'acceptDelivery']);
    Route::put('/deliveries/{delivery}/status', [DeliveryController::class, 'updateStatus']);
    Route::get('/my-deliveries', [DeliveryController::class, 'riderDeliveries']);

    // Payments
    Route::post('/orders/{order}/payment', [PaymentController::class, 'processPayment']);
    Route::get('/orders/{order}/payment', [PaymentController::class, 'getPayment']);
    Route::post('/orders/{order}/payment/chapa/initialize', [PaymentController::class, 'initializeChapaPayment']);
    Route::post('/payment/chapa/verify', [PaymentController::class, 'verifyChapaPayment']);
    Route::post('/orders/{order}/payment/confirm-cash', [PaymentController::class, 'confirmCashPayment']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::post('/notifications/delete-multiple', [NotificationController::class, 'destroyMultiple']);

    // Admin routes
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard-stats', [AdminController::class, 'getDashboardStats']);
        Route::get('/admin/users', [AdminController::class, 'getUsers']);
        Route::post('/admin/users', [AdminController::class, 'createUser']);
        Route::put('/admin/users/{user}/status', [AdminController::class, 'updateUserStatus']);
        Route::delete('/admin/users/{user}', [AdminController::class, 'deleteUser']);
        
        // Orders management
        Route::get('/admin/orders', [AdminController::class, 'getAllOrders']);
        
        // Restaurant management
        Route::get('/admin/restaurants', [AdminController::class, 'getRestaurants']);
        Route::get('/admin/restaurants/pending', [AdminController::class, 'getPendingRestaurants']);
        Route::put('/admin/restaurants/{restaurant}/approve', [AdminController::class, 'approveRestaurant']);
        Route::put('/admin/restaurants/{restaurant}/reject', [AdminController::class, 'rejectRestaurant']);
        
        // Riders management
        Route::get('/admin/riders', [RiderController::class, 'getAllRiders']);
        
        // Settings management
        Route::put('/settings', [\App\Http\Controllers\SettingsController::class, 'update']);
    });

    // Restaurant Dashboard routes
    Route::middleware('role:restaurant')->group(function () {
        Route::get('/restaurant/dashboard-stats', [RestaurantDashboardController::class, 'getDashboardStats']);
        Route::get('/restaurant/orders', [RestaurantDashboardController::class, 'getOrders']);
        Route::put('/restaurant/orders/{order}/status', [RestaurantDashboardController::class, 'updateOrderStatus']);
        Route::get('/restaurant/menu-items', [RestaurantDashboardController::class, 'getMenuItems']);
        Route::post('/restaurant/menu-items', [RestaurantDashboardController::class, 'addMenuItem']);
        Route::put('/restaurant/menu-items/{menuItem}', [RestaurantDashboardController::class, 'updateMenuItem']);
        Route::delete('/restaurant/menu-items/{menuItem}', [RestaurantDashboardController::class, 'deleteMenuItem']);
        Route::get('/restaurant/notifications', [RestaurantDashboardController::class, 'getNotifications']);
        Route::put('/restaurant/notifications/{notification}/read', [RestaurantDashboardController::class, 'markNotificationRead']);
        Route::post('/restaurant/notifications/delete-multiple', [RestaurantDashboardController::class, 'deleteMultipleNotifications']);
        Route::put('/restaurant/profile', [RestaurantDashboardController::class, 'updateProfile']);
    });

    // Rider Dashboard routes
    Route::middleware('role:rider')->group(function () {
        Route::get('/rider/dashboard-stats', [RiderController::class, 'getDashboardStats']);
        Route::get('/rider/profile', [RiderController::class, 'getProfile']);
        Route::put('/rider/profile', [RiderController::class, 'updateProfile']);
        Route::put('/rider/status', [RiderController::class, 'updateStatus']);
        Route::put('/rider/toggle-status', [RiderController::class, 'toggleOnlineStatus']);
        Route::get('/rider/earnings', [RiderController::class, 'getEarnings']);
        Route::get('/rider/earnings-history', [RiderController::class, 'getEarningsHistory']);
        Route::get('/rider/active-delivery', [RiderController::class, 'getActiveDelivery']);
        Route::get('/rider/order-history', [RiderController::class, 'getOrderHistory']);
        
        // Accept and reject delivery requests
        Route::post('/rider/deliveries/accept', [RiderController::class, 'acceptDelivery']);
        Route::post('/rider/deliveries/reject', [RiderController::class, 'rejectDelivery']);
    });

    // Settings routes
    Route::prefix('settings')->group(function () {
        Route::get('/profile', [\App\Http\Controllers\Settings\ProfileController::class, 'edit']);
        Route::patch('/profile', [\App\Http\Controllers\Settings\ProfileController::class, 'update']);
        Route::delete('/profile', [\App\Http\Controllers\Settings\ProfileController::class, 'destroy']);
        
        Route::get('/security', [\App\Http\Controllers\Settings\SecurityController::class, 'edit']);
        Route::put('/password', [\App\Http\Controllers\Settings\SecurityController::class, 'update'])
            ->middleware('throttle:6,1');
        
        Route::get('/appearance', function () {
            return response()->json([
                'message' => 'Appearance settings endpoint',
                'data' => [
                    // Add your appearance settings data here
                ]
            ]);
        });
    });

    // Password change route for all authenticated users
    Route::put('/auth/change-password', [\App\Http\Controllers\Settings\SecurityController::class, 'update'])
        ->middleware('throttle:6,1');

    // Dashboard routes by role
    Route::get('/dashboard', function (Request $request) {
        $user = $request->user();
        
        if ($user->isStudent()) {
            $recentOrders = $user->studentOrders()->with(['restaurant', 'items.menuItem'])->latest()->take(5)->get();
            return response()->json([
                'message' => 'Student dashboard',
                'data' => [
                    'recent_orders' => $recentOrders,
                    'total_orders' => $user->studentOrders()->count(),
                ]
            ]);
        }
        
        if ($user->isRestaurant()) {
            $restaurant = $user->restaurant;
            if ($restaurant) {
                $pendingOrders = $restaurant->orders()->where('status', 'pending')->count();
                $todayOrders = $restaurant->orders()->whereDate('created_at', today())->count();
                return response()->json([
                    'message' => 'Restaurant dashboard',
                    'data' => [
                        'restaurant' => $restaurant,
                        'pending_orders' => $pendingOrders,
                        'today_orders' => $todayOrders,
                    ]
                ]);
            }
        }
        
        if ($user->isRider()) {
            $availableDeliveries = \App\Models\Delivery::pending()->count();
            $myDeliveries = $user->deliveries()->whereDate('created_at', today())->count();
            return response()->json([
                'message' => 'Rider dashboard',
                'data' => [
                    'available_deliveries' => $availableDeliveries,
                    'today_deliveries' => $myDeliveries,
                ]
            ]);
        }
        
        return response()->json(['message' => 'Welcome to dashboard']);
    });
});