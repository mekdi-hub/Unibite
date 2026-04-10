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

        // Update status enum to include 'pending' and 'approved'
        DB::statement("ALTER TABLE restaurants MODIFY COLUMN status ENUM('pending', 'active', 'inactive', 'suspended', 'approved') DEFAULT 'pending'");
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

        // Revert status enum
        DB::statement("ALTER TABLE restaurants MODIFY COLUMN status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'");
    }
};
