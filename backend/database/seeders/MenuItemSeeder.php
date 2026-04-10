<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use App\Models\Category;
use App\Models\Restaurant;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    public function run(): void
    {
        $campusCafe = Restaurant::where('restaurant_name', 'Campus Cafe')->first();
        $pizzaCorner = Restaurant::where('restaurant_name', 'Pizza Corner')->first();

        $beveragesCategory = Category::where('name', 'Beverages')->first();
        $sandwichesCategory = Category::where('name', 'Sandwiches & Wraps')->first();
        $pizzaCategory = Category::where('name', 'Pizza')->first();
        $saladsCategory = Category::where('name', 'Salads')->first();
        $snacksCategory = Category::where('name', 'Snacks')->first();
        $dessertsCategory = Category::where('name', 'Desserts')->first();

        // Campus Cafe Menu Items
        $campusCafeItems = [
            // Beverages
            [
                'category_id' => $beveragesCategory->id,
                'restaurant_id' => $campusCafe->id,
                'name' => 'Espresso',
                'description' => 'Strong Italian coffee shot',
                'price' => 2.50,
                'is_available' => true,
            ],
            [
                'category_id' => $beveragesCategory->id,
                'restaurant_id' => $campusCafe->id,
                'name' => 'Cappuccino',
                'description' => 'Espresso with steamed milk and foam',
                'price' => 3.50,
                'is_available' => true,
            ],
            [
                'category_id' => $beveragesCategory->id,
                'restaurant_id' => $campusCafe->id,
                'name' => 'Iced Coffee',
                'description' => 'Cold brew coffee with ice',
                'price' => 3.00,
                'is_available' => true,
            ],
            // Sandwiches
            [
                'category_id' => $sandwichesCategory->id,
                'restaurant_id' => $campusCafe->id,
                'name' => 'Club Sandwich',
                'description' => 'Turkey, bacon, lettuce, tomato on toasted bread',
                'price' => 8.50,
                'is_available' => true,
            ],
            [
                'category_id' => $sandwichesCategory->id,
                'restaurant_id' => $campusCafe->id,
                'name' => 'Veggie Wrap',
                'description' => 'Fresh vegetables wrapped in tortilla',
                'price' => 6.50,
                'is_available' => true,
            ],
            // Salads
            [
                'category_id' => $saladsCategory->id,
                'restaurant_id' => $campusCafe->id,
                'name' => 'Caesar Salad',
                'description' => 'Romaine lettuce, croutons, parmesan, caesar dressing',
                'price' => 7.00,
                'is_available' => true,
            ],
            // Snacks
            [
                'category_id' => $snacksCategory->id,
                'restaurant_id' => $campusCafe->id,
                'name' => 'Muffin',
                'description' => 'Fresh baked blueberry muffin',
                'price' => 2.50,
                'is_available' => true,
            ],
        ];

        // Pizza Corner Menu Items
        $pizzaCornerItems = [
            // Pizza
            [
                'category_id' => $pizzaCategory->id,
                'restaurant_id' => $pizzaCorner->id,
                'name' => 'Margherita Pizza',
                'description' => 'Tomato sauce, mozzarella, fresh basil',
                'price' => 12.00,
                'is_available' => true,
            ],
            [
                'category_id' => $pizzaCategory->id,
                'restaurant_id' => $pizzaCorner->id,
                'name' => 'Pepperoni Pizza',
                'description' => 'Tomato sauce, mozzarella, pepperoni',
                'price' => 14.00,
                'is_available' => true,
            ],
            [
                'category_id' => $pizzaCategory->id,
                'restaurant_id' => $pizzaCorner->id,
                'name' => 'Vegetarian Pizza',
                'description' => 'Tomato sauce, mozzarella, bell peppers, mushrooms, onions',
                'price' => 13.50,
                'is_available' => true,
            ],
            // Beverages
            [
                'category_id' => $beveragesCategory->id,
                'restaurant_id' => $pizzaCorner->id,
                'name' => 'Coca Cola',
                'description' => 'Classic soft drink',
                'price' => 2.00,
                'is_available' => true,
            ],
            [
                'category_id' => $beveragesCategory->id,
                'restaurant_id' => $pizzaCorner->id,
                'name' => 'Orange Juice',
                'description' => 'Fresh squeezed orange juice',
                'price' => 3.00,
                'is_available' => true,
            ],
            // Desserts
            [
                'category_id' => $dessertsCategory->id,
                'restaurant_id' => $pizzaCorner->id,
                'name' => 'Tiramisu',
                'description' => 'Classic Italian dessert',
                'price' => 5.50,
                'is_available' => true,
            ],
        ];

        // Create all menu items
        foreach ($campusCafeItems as $item) {
            MenuItem::create($item);
        }

        foreach ($pizzaCornerItems as $item) {
            MenuItem::create($item);
        }
    }
}