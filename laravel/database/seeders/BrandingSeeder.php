<?php

namespace Database\Seeders;

use App\Models\Branding;
use Illuminate\Database\Seeder;

class BrandingSeeder extends Seeder
{
    public function run(): void
    {
        Branding::firstOrCreate(
            ['id' => 1],
            [
                'logo_url' => null,
                'hero_background_url' => null,
                'hero_image_url' => null,
            ]
        );
    }
}
