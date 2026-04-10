<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add indexes to frequently queried columns for better performance
     */
    public function up(): void
    {
        // Orders table indexes - only add if columns exist
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'student_id')) {
                $table->index('student_id', 'idx_orders_student_id');
            }
            if (Schema::hasColumn('orders', 'restaurant_id')) {
                $table->index('restaurant_id', 'idx_orders_restaurant_id');
            }
            if (Schema::hasColumn('orders', 'status')) {
                $table->index('status', 'idx_orders_status');
            }
            if (Schema::hasColumn('orders', 'payment_status')) {
                $table->index('payment_status', 'idx_orders_payment_status');
            }
        });

        // Notifications table indexes
        Schema::table('notifications', function (Blueprint $table) {
            if (Schema::hasColumn('notifications', 'user_id')) {
                $table->index('user_id', 'idx_notifications_user_id');
            }
            if (Schema::hasColumn('notifications', 'is_read')) {
                $table->index('is_read', 'idx_notifications_is_read');
            }
        });

        // Deliveries table indexes
        Schema::table('deliveries', function (Blueprint $table) {
            if (Schema::hasColumn('deliveries', 'order_id')) {
                $table->index('order_id', 'idx_deliveries_order_id');
            }
            if (Schema::hasColumn('deliveries', 'rider_id')) {
                $table->index('rider_id', 'idx_deliveries_rider_id');
            }
            if (Schema::hasColumn('deliveries', 'status')) {
                $table->index('status', 'idx_deliveries_status');
            }
        });

        // Menu items table indexes
        Schema::table('menu_items', function (Blueprint $table) {
            if (Schema::hasColumn('menu_items', 'restaurant_id')) {
                $table->index('restaurant_id', 'idx_menu_items_restaurant_id');
            }
            if (Schema::hasColumn('menu_items', 'category_id')) {
                $table->index('category_id', 'idx_menu_items_category_id');
            }
        });

        // Restaurants table indexes
        Schema::table('restaurants', function (Blueprint $table) {
            if (Schema::hasColumn('restaurants', 'user_id')) {
                $table->index('user_id', 'idx_restaurants_user_id');
            }
            if (Schema::hasColumn('restaurants', 'status')) {
                $table->index('status', 'idx_restaurants_status');
            }
        });

        // Order items table indexes
        Schema::table('order_items', function (Blueprint $table) {
            if (Schema::hasColumn('order_items', 'order_id')) {
                $table->index('order_id', 'idx_order_items_order_id');
            }
            if (Schema::hasColumn('order_items', 'menu_item_id')) {
                $table->index('menu_item_id', 'idx_order_items_menu_item_id');
            }
        });

        // Payments table indexes
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'order_id')) {
                $table->index('order_id', 'idx_payments_order_id');
            }
            if (Schema::hasColumn('payments', 'status')) {
                $table->index('status', 'idx_payments_status');
            }
        });

        // Users table indexes
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'role')) {
                $table->index('role', 'idx_users_role');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop indexes if they exist
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_student_id');
            $table->dropIndex('idx_orders_restaurant_id');
            $table->dropIndex('idx_orders_status');
            $table->dropIndex('idx_orders_payment_status');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('idx_notifications_user_id');
            $table->dropIndex('idx_notifications_is_read');
        });

        Schema::table('deliveries', function (Blueprint $table) {
            $table->dropIndex('idx_deliveries_order_id');
            $table->dropIndex('idx_deliveries_rider_id');
            $table->dropIndex('idx_deliveries_status');
        });

        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropIndex('idx_menu_items_restaurant_id');
            $table->dropIndex('idx_menu_items_category_id');
        });

        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropIndex('idx_restaurants_user_id');
            $table->dropIndex('idx_restaurants_status');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('idx_order_items_order_id');
            $table->dropIndex('idx_order_items_menu_item_id');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('idx_payments_order_id');
            $table->dropIndex('idx_payments_status');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role');
        });
    }
};
