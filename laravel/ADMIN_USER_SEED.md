# Admin User Seeder

## Admin User Credentials

- **Email:** pyaelay82@gmail.com
- **Password:** 123456
- **Role:** admin

## How to Run the Seeder

### Option 1: Run only the AdminUserSeeder
```bash
cd laravel
php artisan db:seed --class=AdminUserSeeder
```

### Option 2: Run all seeders (if you have DatabaseSeeder set up)
```bash
cd laravel
php artisan db:seed
```

### Option 3: Fresh migration with seeding
```bash
cd laravel
php artisan migrate:fresh --seed
```

## What the Seeder Does

1. Checks if a user with email `pyaelay82@gmail.com` already exists
2. If not, creates a new admin user with:
   - Name: "Admin"
   - Email: pyaelay82@gmail.com
   - Password: 123456 (hashed)
   - Role: admin
   - Email verified
3. If the user exists, it updates the password and ensures the role is set to admin

## Login to Admin Dashboard

1. Go to: http://localhost:3003/
2. Enter credentials:
   - Email: `pyaelay82@gmail.com`
   - Password: `123456`

## Notes

- The seeder is idempotent - you can run it multiple times safely
- If the user exists, it will update the password to ensure it matches
- The password is hashed using Laravel's Hash facade

