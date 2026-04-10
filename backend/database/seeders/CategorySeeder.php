<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Beverages',
                'description' => 'Hot and cold drinks, coffee, tea, juices',
                'status' => 'active',
            ],
            [
                'name' => 'Sandwiches & Wraps',
                'description' => 'Fresh sandwiches, wraps, and subs',
                'status' => 'active',
            ],
            [
                'name' => 'Pizza',
                'description' => 'Various pizza flavors and sizes',
                'status' => 'active',
            ],
            [
                'name' => 'Salads',
                'description' => 'Fresh and healthy salad options',
                'status' => 'active',
            ],
            [
                'name' => 'Snacks',
                'description' => 'Quick bites and finger foods',
                'status' => 'active',
            ],
            [
                'name' => 'Desserts',
                'description' => 'Sweet treats and desserts',
                'status' => 'active',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}