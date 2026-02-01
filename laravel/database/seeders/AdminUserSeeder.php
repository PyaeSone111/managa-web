<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin user already exists
        $admin = User::where('email', 'pyaelay82@gmail.com')->first();

        if (!$admin) {
            User::create([
                'name' => 'Admin',
                'email' => 'pyaelay82@gmail.com',
                'password' => Hash::make('123456'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);

            $this->command->info('Admin user created successfully!');
            $this->command->info('Email: pyaelay82@gmail.com');
            $this->command->info('Password: 123456');
        } else {
            // Update existing user to ensure it's an admin
            $admin->update([
                'password' => Hash::make('123456'),
                'role' => 'admin',
            ]);

            $this->command->info('Admin user updated successfully!');
        }
    }
}

