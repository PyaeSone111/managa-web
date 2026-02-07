<?php

namespace Database\Seeders;

use App\Models\Theme;
use Illuminate\Database\Seeder;

class ThemeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $themes = [
            [
                'name' => 'Default (Subdued Green)',
                'slug' => 'default',
                'is_active' => true,
                'config' => [
                    'bodyColor' => '#1a2524',
                    'primary' => '#627160',
                    'primaryHover' => '#30463D',
                    'onPrimary' => '#FFFFFF',
                    'cardBg' => '#ffffff',
                    'cardBorder' => 'rgba(98, 113, 96, 0.25)',
                    'glassBg' => '#ffffff',
                    'textMuted' => '#3d4a48',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
            [
                'name' => 'Light Glass (Two-tone)',
                'slug' => 'light-glass',
                'is_active' => false,
                'config' => [
                    'bodyColor' => '#4a3d52',
                    'primary' => '#92AEF4',
                    'primaryHover' => '#61486B',
                    'onPrimary' => '#61486B',
                    'cardBg' => '#ffffff',
                    'cardBorder' => 'rgba(146, 174, 244, 0.3)',
                    'glassBg' => '#ffffff',
                    'textMuted' => '#5c4d65',
                    'fontFamily' => '"Neue Montreal", Inter, system-ui, sans-serif',
                ],
            ],
            [
                'name' => 'Digital Health Records',
                'slug' => 'digital-health',
                'is_active' => false,
                'config' => [
                    'bodyColor' => '#3d4542',
                    'primary' => '#BDE6EE',
                    'primaryHover' => '#7a8580',
                    'onPrimary' => '#3d4542',
                    'cardBg' => '#ffffff',
                    'cardBorder' => 'rgba(189, 230, 238, 0.4)',
                    'glassBg' => '#ffffff',
                    'textMuted' => '#4a5350',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
            [
                'name' => 'Green Tech Solutions',
                'slug' => 'green-tech',
                'is_active' => false,
                'config' => [
                    'bodyColor' => '#3d462e',
                    'primary' => '#8C946E',
                    'primaryHover' => '#505B3D',
                    'onPrimary' => '#3d462e',
                    'cardBg' => '#ffffff',
                    'cardBorder' => 'rgba(140, 148, 110, 0.3)',
                    'glassBg' => '#ffffff',
                    'textMuted' => '#4a5538',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
            [
                'name' => 'Virtual Classroom',
                'slug' => 'virtual-classroom',
                'is_active' => false,
                'config' => [
                    'bodyColor' => '#5c3824',
                    'primary' => '#5C80F5',
                    'primaryHover' => '#714830',
                    'onPrimary' => '#FFFFFF',
                    'cardBg' => '#ffffff',
                    'cardBorder' => 'rgba(92, 128, 245, 0.25)',
                    'glassBg' => '#ffffff',
                    'textMuted' => '#6b4a32',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
            [
                'name' => 'Augmented Reality (AR)',
                'slug' => 'augmented-reality',
                'is_active' => false,
                'config' => [
                    'bodyColor' => '#2d3138',
                    'primary' => '#5B636E',
                    'primaryHover' => '#383F4C',
                    'onPrimary' => '#FFFFFF',
                    'cardBg' => '#ffffff',
                    'cardBorder' => 'rgba(91, 99, 110, 0.25)',
                    'glassBg' => '#ffffff',
                    'textMuted' => '#4a5058',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
            [
                'name' => 'App Interface Wireframes',
                'slug' => 'app-wireframes',
                'is_active' => false,
                'config' => [
                    'bodyColor' => '#4a4545',
                    'primary' => '#EAAAB2',
                    'primaryHover' => '#A8A3A3',
                    'onPrimary' => '#4a4545',
                    'cardBg' => '#ffffff',
                    'cardBorder' => 'rgba(234, 170, 178, 0.35)',
                    'glassBg' => '#ffffff',
                    'textMuted' => '#5c5858',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
            [
                'name' => 'Husky Walk in Autumn',
                'slug' => 'husky-walk-autumn',
                'is_active' => false,
                'config' => [
                    'bodyColor' => '#3d3230',
                    'primary' => '#867887',
                    'primaryHover' => '#5A4442',
                    'onPrimary' => '#FFFFFF',
                    'cardBg' => '#ffffff',
                    'cardBorder' => 'rgba(134, 120, 135, 0.3)',
                    'glassBg' => '#ffffff',
                    'textMuted' => '#55484a',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
            [
                'name' => 'Serene Winter Mountain Lake',
                'slug' => 'winter-mountain-lake',
                'is_active' => false,
                'config' => [
                    'bodyColor' => '#1e3639',
                    'primary' => '#516D74',
                    'primaryHover' => '#2E4B4E',
                    'onPrimary' => '#FFFFFF',
                    'cardBg' => '#ffffff',
                    'cardBorder' => 'rgba(81, 109, 116, 0.25)',
                    'glassBg' => '#ffffff',
                    'textMuted' => '#3d5558',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
        ];

        Theme::where('slug', '!=', 'default')->update(['is_active' => false]);
        Theme::where('slug', 'default')->update(['is_active' => true]);

        foreach ($themes as $data) {
            Theme::updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, ['is_active' => $data['slug'] === 'default'])
            );
        }
    }
}
