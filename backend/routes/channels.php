<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private channel for user notifications
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Channel for admin notifications
Broadcast::channel('admin', function ($user) {
    return $user->role === 'admin';
});

// Channel for restaurant notifications
Broadcast::channel('restaurant.{restaurantId}', function ($user, $restaurantId) {
    return $user->role === 'restaurant' && $user->restaurant && $user->restaurant->id == $restaurantId;
});

// Channel for rider notifications
Broadcast::channel('rider.{riderId}', function ($user, $riderId) {
    return $user->role === 'rider' && $user->id == $riderId;
});