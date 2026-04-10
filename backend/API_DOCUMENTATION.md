# UniBite API Documentation

## Base URL
```
http://backendi.test/api
```

## Authentication
The API uses Laravel Sanctum for authentication. Include the token in the Authorization header:
```
Authorization: Bearer {token}
```

## Response Format
All responses follow this format:
```json
{
    "message": "Success message",
    "data": {...} // Response data (optional)
}
```

## Error Format
```json
{
    "message": "Error message",
    "errors": {...} // Validation errors (optional)
}
```

## Endpoints

### Authentication

#### Register User
```
POST /auth/register
```
**Body:**
```json
{
    "name": "John Doe",
    "email": "john@student.edu",
    "password": "password123",
    "password_confirmation": "password123",
    "phone": "+1234567890",
    "role": "student" // student, restaurant, rider
}
```

#### Login
```
POST /auth/login
```
**Body:**
```json
{
    "email": "john@student.edu",
    "password": "password123"
}
```

#### Logout
```
POST /auth/logout
```
**Headers:** `Authorization: Bearer {token}`

### Categories

#### Get All Categories
```
GET /categories
```
Returns categories with their active menu items.

#### Get Single Category
```
GET /categories/{id}
```

### Restaurants

#### Get All Restaurants
```
GET /restaurants
```

#### Get Single Restaurant
```
GET /restaurants/{id}
```

#### Get My Restaurant (Restaurant owners only)
```
GET /my-restaurant
```
**Headers:** `Authorization: Bearer {token}`

### Menu Items

#### Get All Menu Items
```
GET /menu-items?category_id={id}&restaurant_id={id}&available=true
```

#### Get Single Menu Item
```
GET /menu-items/{id}
```

#### Create Menu Item (Restaurant owners only)
```
POST /menu-items
```
**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
    "category_id": 1,
    "restaurant_id": 1,
    "name": "Burger",
    "description": "Delicious beef burger",
    "price": 12.50,
    "image": "burger.jpg",
    "is_available": true
}
```

#### Update Menu Item (Restaurant owners only)
```
PUT /menu-items/{id}
```

#### Delete Menu Item (Restaurant owners only)
```
DELETE /menu-items/{id}
```

### Orders

#### Get Orders
```
GET /orders?status={status}
```
**Headers:** `Authorization: Bearer {token}`
- Students see their own orders
- Restaurants see orders for their restaurant
- Riders see their assigned deliveries

#### Create Order (Students only)
```
POST /orders
```
**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
    "restaurant_id": 1,
    "delivery_address": "Dorm Room 123, Building A",
    "payment_method": "cash_on_delivery",
    "notes": "Please call when you arrive",
    "items": [
        {
            "menu_item_id": 1,
            "quantity": 2
        },
        {
            "menu_item_id": 3,
            "quantity": 1
        }
    ]
}
```

#### Get Single Order
```
GET /orders/{id}
```
**Headers:** `Authorization: Bearer {token}`

#### Update Order Status
```
PUT /orders/{id}/status
```
**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
    "status": "accepted" // pending, accepted, preparing, ready, out_for_delivery, delivered, cancelled
}
```

#### Cancel Order
```
PUT /orders/{id}/cancel
```
**Headers:** `Authorization: Bearer {token}`

### Deliveries (Riders only)

#### Get Available Deliveries
```
GET /deliveries/available
```
**Headers:** `Authorization: Bearer {token}`

#### Accept Delivery
```
POST /deliveries/{id}/accept
```
**Headers:** `Authorization: Bearer {token}`

#### Update Delivery Status
```
PUT /deliveries/{id}/status
```
**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
    "status": "picked_up", // assigned, picked_up, delivered
    "notes": "Optional delivery notes"
}
```

#### Get My Deliveries
```
GET /my-deliveries
```
**Headers:** `Authorization: Bearer {token}`

### Payments

#### Process Payment
```
POST /orders/{id}/payment
```
**Headers:** `Authorization: Bearer {token}`
**Body:**
```json
{
    "payment_method": "mobile_payment",
    "transaction_id": "TXN123456"
}
```

#### Get Payment Info
```
GET /orders/{id}/payment
```
**Headers:** `Authorization: Bearer {token}`

#### Confirm Cash Payment (Riders only)
```
POST /orders/{id}/payment/confirm-cash
```
**Headers:** `Authorization: Bearer {token}`

### User Profile

#### Get Profile
```
GET /profile
```
**Headers:** `Authorization: Bearer {token}`

#### Get Dashboard
```
GET /dashboard
```
**Headers:** `Authorization: Bearer {token}`
Returns role-specific dashboard data.

## Order Status Flow

1. **pending** - Order placed by student
2. **accepted** - Restaurant accepts the order
3. **preparing** - Restaurant is preparing the food
4. **ready** - Food is ready for pickup
5. **out_for_delivery** - Rider has picked up the order
6. **delivered** - Order delivered to student
7. **cancelled** - Order cancelled (only possible in pending/accepted states)

## Payment Methods

- `cash_on_delivery` - Pay cash when food is delivered
- `mobile_payment` - Mobile payment (M-Pesa, etc.)
- `digital_wallet` - Digital wallet payment

## User Roles

- `student` - Can place orders, view order history
- `restaurant` - Can manage menu items, accept/prepare orders
- `rider` - Can accept deliveries, update delivery status
- `admin` - Can manage categories and system settings

## Sample Test Users

### Students
- Email: `john@student.edu`, Password: `password`
- Email: `jane@student.edu`, Password: `password`

### Restaurants
- Email: `cafe@unibite.com`, Password: `password` (Campus Cafe)
- Email: `pizza@unibite.com`, Password: `password` (Pizza Corner)

### Riders
- Email: `mike@rider.com`, Password: `password`
- Email: `sarah@rider.com`, Password: `password`

### Admin
- Email: `admin@unibite.com`, Password: `password`