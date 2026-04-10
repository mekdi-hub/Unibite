<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$service = app('App\Services\RiderAssignmentService');
$order = App\Models\Order::find(48);

if ($order) {
    $result = $service->assignOrderToRiders($order);
    echo $result ? "Successfully assigned order to riders\n" : "Failed to assign order\n";
} else {
    echo "Order not found\n";
}
