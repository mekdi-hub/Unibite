<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->string('restaurant_name');
            $table->text('description')->nullable();
            $table->text('address');
            $table->string('phone', 20);
            $table->string('image')->nullable();
            $table->time('opening_time');
            $table->time('closing_time');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->decimal('delivery_fee', 8, 2)->default(0.00);
            $table->decimal('min_order_amount', 8, 2)->default(0.00);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};