<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update existing 'accepted' values to 'confirmed'
        DB::table('orders')
            ->where('status', 'accepted')
            ->update(['status' => 'confirmed']);

        // Modify the enum column to use the new values
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        // Revert back to old enum values
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending'");
        
        // Update 'confirmed' back to 'accepted'
        DB::table('orders')
            ->where('status', 'confirmed')
            ->update(['status' => 'accepted']);
    }
};
