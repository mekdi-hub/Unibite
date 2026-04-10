<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First, update any existing status values that don't match the new enum
        DB::statement("UPDATE orders SET status = 'pending' WHERE status NOT IN ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled')");
        
        // Add fields to orders table
        Schema::table('orders', function (Blueprint $table) {
            // Modify existing status column to include new statuses
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'preparing', 'ready_for_pickup', 'assigned_to_rider', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending'");
            
            $table->timestamp('ready_at')->nullable()->after('status');
            $table->timestamp('assigned_at')->nullable()->after('ready_at');
            $table->timestamp('picked_up_at')->nullable()->after('assigned_at');
        });

        // Add fields to deliveries table
        Schema::table('deliveries', function (Blueprint $table) {
            $table->enum('assignment_status', [
                'pending',
                'offered',
                'accepted',
                'rejected',
                'expired',
                'completed'
            ])->default('pending')->after('status');
            
            $table->timestamp('offered_at')->nullable()->after('assignment_status');
            $table->timestamp('accepted_at')->nullable()->after('offered_at');
            $table->timestamp('rejected_at')->nullable()->after('accepted_at');
            $table->timestamp('expires_at')->nullable()->after('rejected_at');
            $table->integer('offer_count')->default(0)->after('expires_at');
        });

        // Add fields to users table for riders
        Schema::table('users', function (Blueprint $table) {
            $table->enum('rider_status', ['offline', 'online', 'busy'])->default('offline')->after('role')->nullable();
            $table->boolean('is_available')->default(true)->after('rider_status');
            $table->decimal('latitude', 10, 8)->nullable()->after('is_available');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->timestamp('last_location_update')->nullable()->after('longitude');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['ready_at', 'assigned_at', 'picked_up_at']);
        });

        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropColumn([
                'assignment_status',
                'offered_at',
                'accepted_at',
                'rejected_at',
                'expires_at',
                'offer_count'
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'rider_status',
                'is_available',
                'latitude',
                'longitude',
                'last_location_update'
            ]);
        });
    }
};
