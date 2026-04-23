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

        // Modify the enum column to use the new values (PostgreSQL syntax)
        DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
        DB::statement("ALTER TABLE orders ALTER COLUMN status DROP DEFAULT");
        DB::statement("ALTER TABLE orders ALTER COLUMN status TYPE VARCHAR(20)");
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled'))");
        DB::statement("ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending'");
        DB::statement("ALTER TABLE orders ALTER COLUMN status SET NOT NULL");
    }

    public function down(): void
    {
        // Revert back to old enum values (PostgreSQL syntax)
        DB::statement("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
        DB::statement("ALTER TABLE orders ALTER COLUMN status DROP DEFAULT");
        DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'))");
        DB::statement("ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending'");
        DB::statement("ALTER TABLE orders ALTER COLUMN status SET NOT NULL");
        
        // Update 'confirmed' back to 'accepted'
        DB::table('orders')
            ->where('status', 'confirmed')
            ->update(['status' => 'accepted']);
    }
};
