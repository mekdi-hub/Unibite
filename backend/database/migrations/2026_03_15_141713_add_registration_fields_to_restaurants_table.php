<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->string('business_license')->nullable()->after('status');
            $table->json('menu_images')->nullable()->after('business_license');
            $table->string('food_categories')->nullable()->after('menu_images');
            $table->string('bank_account_name')->nullable()->after('food_categories');
            $table->string('bank_account_number')->nullable()->after('bank_account_name');
            $table->string('bank_name')->nullable()->after('bank_account_number');
        });

        // Update status enum to include 'pending' and 'approved' (PostgreSQL syntax)
        DB::statement("ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_status_check");
        DB::statement("ALTER TABLE restaurants ALTER COLUMN status DROP DEFAULT");
        DB::statement("ALTER TABLE restaurants ALTER COLUMN status TYPE VARCHAR(20)");
        DB::statement("ALTER TABLE restaurants ADD CONSTRAINT restaurants_status_check CHECK (status IN ('pending', 'active', 'inactive', 'suspended', 'approved'))");
        DB::statement("ALTER TABLE restaurants ALTER COLUMN status SET DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn([
                'business_license',
                'menu_images',
                'food_categories',
                'bank_account_name',
                'bank_account_number',
                'bank_name'
            ]);
        });

        // Revert status enum (PostgreSQL syntax)
        DB::statement("ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_status_check");
        DB::statement("ALTER TABLE restaurants ALTER COLUMN status DROP DEFAULT");
        DB::statement("ALTER TABLE restaurants ADD CONSTRAINT restaurants_status_check CHECK (status IN ('active', 'inactive', 'suspended'))");
        DB::statement("ALTER TABLE restaurants ALTER COLUMN status SET DEFAULT 'active'");
    }
};
