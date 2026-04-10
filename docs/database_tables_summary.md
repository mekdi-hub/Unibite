# UniBite Database Tables Summary

## Quick Reference

### Table Count: 9 Tables
1. **users** - Multi-role user management
2. **restaurants** - Restaurant profiles and business settings
3. **notifications** - System notifications for all users
4. **categories** - Food categories
5. **menu_items** - Food items for ordering
6. **orders** - Order management
7. **order_items** - Order line items
8. **deliveries** - Delivery tracking
9. **payments** - Payment processing

## Table Sizes (Estimated)

| Table | Primary Use | Expected Volume | Growth Rate |
|-------|-------------|-----------------|-------------|
| users | All user types | 1,000-10,000 | Medium |
| restaurants | Restaurant profiles | 10-100 | Low |
| notifications | System notifications | 10,000-1,000,000 | High |
| categories | Food categories | 10-50 | Low |
| menu_items | Food catalog | 100-1,000 | Medium |
| orders | Order records | 1,000-100,000 | High |
| order_items | Order details | 5,000-500,000 | High |
| deliveries | Delivery tracking | 1,000-100,000 | High |
| payments | Payment records | 1,000-100,000 | High |

## Key Features

### Restaurant Profile System
- Detailed restaurant information storage
- Business hours and delivery settings
- Restaurant-specific configurations
- Status management for restaurants

### Notification System
- Real-time notifications for all user types
- Multiple notification types (order, delivery, payment, system, promotion)
- Read/unread status tracking
- JSON data storage for flexible notification content

### Multi-Role User System
- Single `users` table handles all user types
- Role-based differentiation (student, restaurant, rider, admin)
- Status management (active, inactive, suspended)

### Menu Management
- Hierarchical organization with categories
- Restaurant-specific menu items
- Availability tracking
- Price management

### Order Processing
- Complete order lifecycle tracking
- Multiple payment methods support
- Delivery address validation
- Order status progression

### Delivery System
- Rider assignment and tracking
- Pickup and delivery timestamps
- Delivery status management
- One-to-one order-delivery relationship

### Payment Processing
- Multiple payment method support
- Transaction tracking
- Payment status management
- Refund capability

## Data Flow

```
Student → Browse Menu → Add to Cart → Place Order → Make Payment
                                          ↓
Restaurant → Receive Order → Accept/Reject → Prepare Food → Mark Ready
                                                              ↓
Rider → View Available → Accept Delivery → Pickup → Deliver → Complete
                                                        ↓
Student → Track Order → Receive Food → Order Complete
```

## Critical Relationships

1. **Order Integrity**: Every order must have a valid student and restaurant
2. **Menu Ownership**: Menu items belong to specific restaurants
3. **Order Details**: Order items reference both orders and menu items
4. **Delivery Assignment**: Each order gets exactly one delivery record
5. **Payment Tracking**: Each order has exactly one payment record

## Constraints and Validations

### Database Level
- Foreign key constraints ensure referential integrity
- Enum fields restrict status values
- NOT NULL constraints on required fields
- Unique constraints on email addresses

### Application Level
- Role-based access control
- Campus location validation
- Business rule enforcement
- Status transition validation

## Migration Order

The migrations must be run in this specific order due to foreign key dependencies:

1. `add_role_to_users_table` - Extends existing users table
2. `create_restaurants_table` - Depends on users
3. `create_notifications_table` - Depends on users
4. `create_categories_table` - Independent table
5. `create_menu_items_table` - Depends on users, restaurants, and categories
6. `create_orders_table` - Depends on users and restaurants
7. `create_order_items_table` - Depends on orders and menu_items
8. `create_deliveries_table` - Depends on orders and users
9. `create_payments_table` - Depends on orders

## Backup and Maintenance

### Critical Tables (High Priority Backup)
- users
- restaurants
- orders
- order_items
- payments

### Reference Tables (Medium Priority)
- menu_items
- deliveries
- notifications

### Configuration Tables (Low Priority)
- categories

### Recommended Backup Schedule
- **Real-time**: Transaction logs
- **Hourly**: Critical tables
- **Daily**: Full database backup
- **Weekly**: Full system backup with files