# UniBite Database Setup Guide

## MySQL Database Configuration

### Prerequisites
- MySQL 8.0 or higher installed
- PHP 8.2 or higher with MySQL extensions enabled
- Composer installed

### Step 1: Create MySQL Database

Open your MySQL client (MySQL Workbench, phpMyAdmin, or command line) and create the database:

```sql
CREATE DATABASE unibite CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or using MySQL command line:

```bash
mysql -u root -p
```

Then run:
```sql
CREATE DATABASE unibite CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### Step 2: Configure Environment Variables

Your `.env` file is already configured for MySQL. Verify these settings:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=unibite
DB_USERNAME=root
DB_PASSWORD=
```

**Important**: Update `DB_PASSWORD` with your MySQL root password if you have one set.

### Step 3: Install Dependencies

Navigate to the backend directory and install PHP dependencies:

```bash
cd backend
composer install
```

### Step 4: Run Migrations

Execute the database migrations to create all tables:

```bash
php artisan migrate
```

This will create the following tables in order:
1. users (with role, phone, status fields)
2. restaurants
3. notifications
4. categories
5. menu_items
6. orders
7. order_items
8. deliveries
9. payments

### Step 5: Seed Database (Optional)

To populate the database with sample data for testing:

```bash
php artisan db:seed
```

### Step 6: Verify Database Setup

Check that all tables were created successfully:

```bash
php artisan migrate:status
```

Or connect to MySQL and verify:

```sql
USE unibite;
SHOW TABLES;
```

You should see 9 tables plus Laravel's default tables (migrations, sessions, cache, etc.).

## Database Connection Troubleshooting

### Common Issues

#### 1. Access Denied Error
```
SQLSTATE[HY000] [1045] Access denied for user 'root'@'localhost'
```

**Solution**: Update your MySQL password in `.env`:
```env
DB_PASSWORD=your_mysql_password
```

#### 2. Database Does Not Exist
```
SQLSTATE[HY000] [1049] Unknown database 'unibite'
```

**Solution**: Create the database first:
```sql
CREATE DATABASE unibite;
```

#### 3. Connection Refused
```
SQLSTATE[HY000] [2002] Connection refused
```

**Solution**: 
- Ensure MySQL service is running
- Check if MySQL is listening on port 3306
- Verify DB_HOST is correct (127.0.0.1 or localhost)

#### 4. Character Set Issues

**Solution**: Ensure your database uses utf8mb4:
```sql
ALTER DATABASE unibite CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Verify MySQL Service Status

**Windows**:
```bash
# Check if MySQL is running
sc query MySQL80

# Start MySQL service
net start MySQL80
```

**Linux/Mac**:
```bash
# Check MySQL status
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql
```

## Fresh Database Reset

If you need to reset the database completely:

```bash
# Drop all tables and re-run migrations
php artisan migrate:fresh

# Drop all tables, re-run migrations, and seed data
php artisan migrate:fresh --seed
```

## Database Backup

### Create Backup

```bash
mysqldump -u root -p unibite > unibite_backup.sql
```

### Restore Backup

```bash
mysql -u root -p unibite < unibite_backup.sql
```

## Performance Optimization

### Add Indexes (Already included in migrations)

The migrations already include necessary indexes for:
- Foreign keys
- Status fields
- Frequently queried columns
- Unique constraints

### Query Optimization Tips

1. Use eager loading to avoid N+1 queries:
```php
$orders = Order::with(['items', 'restaurant', 'student'])->get();
```

2. Use database transactions for multiple operations:
```php
DB::transaction(function () {
    // Multiple database operations
});
```

3. Cache frequently accessed data:
```php
Cache::remember('categories', 3600, function () {
    return Category::active()->get();
});
```

## Next Steps

After setting up the database:

1. Run the application: `php artisan serve`
2. Test API endpoints using Postman or similar tools
3. Create initial admin user
4. Set up the frontend React application
5. Test the complete flow from order placement to delivery

## Database Monitoring

### Check Database Size

```sql
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'unibite'
GROUP BY table_schema;
```

### Check Table Sizes

```sql
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'unibite'
ORDER BY (data_length + index_length) DESC;
```

## Security Recommendations

1. **Never commit `.env` file** - It contains sensitive database credentials
2. **Use strong passwords** for database users
3. **Create separate database user** for the application (don't use root in production)
4. **Enable SSL** for database connections in production
5. **Regular backups** - Set up automated daily backups
6. **Monitor access logs** - Keep track of database access patterns

## Production Database Setup

For production environments:

1. Create a dedicated database user:
```sql
CREATE USER 'unibite_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON unibite.* TO 'unibite_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Update `.env` with production credentials:
```env
DB_USERNAME=unibite_user
DB_PASSWORD=strong_password
```

3. Enable query logging for monitoring:
```sql
SET GLOBAL general_log = 'ON';
SET GLOBAL log_output = 'TABLE';
```