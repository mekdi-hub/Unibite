// Helper functions to get appropriate images for restaurants and food items

// Array of restaurant images from Unsplash
const restaurantImages = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&q=80', // Restaurant interior
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop&q=80', // Restaurant dining
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop&q=80', // Restaurant bar
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop&q=80', // Restaurant exterior
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop&q=80', // Cafe interior
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=300&fit=crop&q=80', // Food counter
  'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=400&h=300&fit=crop&q=80', // Modern restaurant
  'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=400&h=300&fit=crop&q=80', // Cozy restaurant
]

// Get restaurant image based on ID
export const getRestaurantImage = (restaurant) => {
  if (restaurant?.image) return restaurant.image
  
  // Use restaurant ID to consistently get the same image for the same restaurant
  const index = restaurant?.id ? (restaurant.id - 1) % restaurantImages.length : 0
  return restaurantImages[index]
}

// Get food image based on food name
export const getFoodImage = (item) => {
  // If item has an uploaded image, construct the full URL
  if (item?.image) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://unibite-sxc9.onrender.com/api'
    return `${backendUrl}/storage/${item.image}`
  }
  
  const name = item?.name?.toLowerCase() || ''
  
  // Pizza
  if (name.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&q=80'
  }
  
  // Burger
  if (name.includes('burger') || name.includes('hamburger')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop&q=80'
  }
  
  // Pasta
  if (name.includes('pasta') || name.includes('spaghetti') || name.includes('fettuccine') || name.includes('linguine')) {
    return 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop&q=80'
  }
  
  // Salad
  if (name.includes('salad') || name.includes('caesar')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&q=80'
  }
  
  // Sandwich
  if (name.includes('sandwich') || name.includes('sub') || name.includes('wrap')) {
    return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop&q=80'
  }
  
  // Chicken
  if (name.includes('chicken') || name.includes('wings') || name.includes('fried chicken')) {
    return 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop&q=80'
  }
  
  // Steak / Beef
  if (name.includes('steak') || name.includes('beef') || name.includes('ribeye')) {
    return 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop&q=80'
  }
  
  // Sushi
  if (name.includes('sushi') || name.includes('roll') || name.includes('sashimi')) {
    return 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop&q=80'
  }
  
  // Tacos / Mexican
  if (name.includes('taco') || name.includes('burrito') || name.includes('quesadilla') || name.includes('nachos')) {
    return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop&q=80'
  }
  
  // Ramen / Noodles
  if (name.includes('ramen') || name.includes('noodle') || name.includes('pho')) {
    return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&q=80'
  }
  
  // Rice / Bowl
  if (name.includes('rice') || name.includes('bowl') || name.includes('fried rice')) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80'
  }
  
  // Soup
  if (name.includes('soup') || name.includes('chowder') || name.includes('bisque')) {
    return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&q=80'
  }
  
  // Breakfast
  if (name.includes('breakfast') || name.includes('pancake') || name.includes('waffle') || name.includes('eggs') || name.includes('omelet')) {
    return 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop&q=80'
  }
  
  // Dessert / Cake
  if (name.includes('cake') || name.includes('dessert') || name.includes('chocolate') || name.includes('brownie')) {
    return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&q=80'
  }
  
  // Ice Cream
  if (name.includes('ice cream') || name.includes('gelato') || name.includes('sundae')) {
    return 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop&q=80'
  }
  
  // Coffee / Drinks
  if (name.includes('coffee') || name.includes('latte') || name.includes('cappuccino') || name.includes('espresso')) {
    return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&q=80'
  }
  
  // Smoothie / Juice
  if (name.includes('smoothie') || name.includes('juice') || name.includes('shake')) {
    return 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop&q=80'
  }
  
  // Fries / Sides
  if (name.includes('fries') || name.includes('french fries') || name.includes('chips')) {
    return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop&q=80'
  }
  
  // Seafood / Fish
  if (name.includes('fish') || name.includes('salmon') || name.includes('seafood') || name.includes('shrimp')) {
    return 'https://images.unsplash.com/photo-1559737558-2f5a35f4523e?w=400&h=300&fit=crop&q=80'
  }
  
  // Hot Dog
  if (name.includes('hot dog') || name.includes('hotdog')) {
    return 'https://images.unsplash.com/photo-1612392062798-2dbaa2c5e72e?w=400&h=300&fit=crop&q=80'
  }
  
  // Curry
  if (name.includes('curry') || name.includes('tikka') || name.includes('masala')) {
    return 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop&q=80'
  }
  
  // Kebab
  if (name.includes('kebab') || name.includes('shawarma') || name.includes('gyro')) {
    return 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop&q=80'
  }
  
  // Default food image
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80'
}

// Get smaller versions for thumbnails
export const getRestaurantThumbnail = (restaurant) => {
  return getRestaurantImage(restaurant).replace('w=400&h=300', 'w=100&h=100')
}

export const getFoodThumbnail = (item) => {
  return getFoodImage(item).replace('w=400&h=300', 'w=200&h=200')
}
