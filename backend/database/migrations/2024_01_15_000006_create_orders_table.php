<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('restaurant_id')->constrained('restaurants')->onDelete('cascade');
            $table->decimal('total_amount', 10, 2);
            $table->text('delivery_address');
            $table->enum('status', [
                'pending', 
                'accepted', 
                'preparing', 
                'ready', 
                'out_for_delivery', 
                'delivered', 
                'cancelled'
            ])->default('pending');
            $table->enum('payment_method', [
                'cash_on_delivery', 
                'mobile_payment', 
                'digital_wallet'
            ]);
            $table->enum('payment_status', [
                'pending', 
                'paid', 
                'failed', 
                'refunded'
            ])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};