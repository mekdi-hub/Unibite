<?php
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Laravel API is running',
        'version' => app()->version(),
        'timestamp' => now()
    ]);
});

Route::get('/test', function () {
    return response()->json(['status' => 'OK', 'message' => 'Test endpoint working']);
});
