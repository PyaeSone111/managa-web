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
                    'bodyBackground' => 'linear-gradient(to bottom right, #0D2625, #30463D, #627160)',
                    'bodyColor' => '#C6CEC5',
                    'primary' => '#627160',
                    'primaryHover' => '#30463D',
                    'onPrimary' => '#FFFFFF',
                    'cardBg' => 'rgba(164, 180, 164, 0.4)',
                    'cardBorder' => 'rgba(198, 206, 197, 0.3)',
                    'glassBg' => 'rgba(198, 206, 197, 0.3)',
                    'textMuted' => '#C6CEC5',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
            [
                'name' => 'Light Glass (Two-tone)',
                'slug' => 'light-glass',
                'is_active' => false,
                'config' => [
                    'bodyBackground' => 'linear-gradient(135deg, #F4F8FE 0%, #E3EBFA 50%, #C7CBE7 100%)',
                    'bodyColor' => '#61486B',
                    'primary' => '#92AEF4',
                    'primaryHover' => '#61486B',
                    'onPrimary' => '#61486B',
                    'cardBg' => 'rgba(255, 255, 255, 0.7)',
                    'cardBorder' => 'rgba(146, 174, 244, 0.3)',
                    'glassBg' => 'rgba(227, 235, 250, 0.6)',
                    'textMuted' => '#61486B',
                    'fontFamily' => '"Neue Montreal", Inter, system-ui, sans-serif',
                ],
            ],
            [
                'name' => 'Digital Health Records',
                'slug' => 'digital-health',
                'is_active' => false,
                'config' => [
                    'bodyBackground' => 'linear-gradient(135deg, #FDFDFD 0%, #F1F2F1 40%, #E7E7E6 70%, #D9E4BA 100%)',
                    'bodyColor' => '#A6ACA3',
                    'primary' => '#BDE6EE',
                    'primaryHover' => '#A6ACA3',
                    'onPrimary' => '#A6ACA3',
                    'cardBg' => 'rgba(253, 253, 253, 0.85)',
                    'cardBorder' => 'rgba(217, 228, 186, 0.5)',
                    'glassBg' => 'rgba(241, 242, 241, 0.6)',
                    'textMuted' => '#A6ACA3',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
            [
                'name' => 'Green Tech Solutions',
                'slug' => 'green-tech',
                'is_active' => false,
                'config' => [
                    'bodyBackground' => 'linear-gradient(to bottom right, #FCFCFC, #EDEEEC, #D5E0C3, #B4BD9B)',
                    'bodyColor' => '#505B3D',
                    'primary' => '#8C946E',
                    'primaryHover' => '#505B3D',
                    'onPrimary' => '#505B3D',
                    'cardBg' => 'rgba(252, 252, 252, 0.9)',
                    'cardBorder' => 'rgba(212, 224, 195, 0.5)',
                    'glassBg' => 'rgba(237, 238, 236, 0.6)',
                    'textMuted' => '#505B3D',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
            [
                'name' => 'Virtual Classroom',
                'slug' => 'virtual-classroom',
                'is_active' => false,
                'config' => [
                    'bodyBackground' => 'linear-gradient(135deg, #F7F8F8 0%, #D3E0E4 50%, #F2DB9A 100%)',
                    'bodyColor' => '#714830',
                    'primary' => '#5C80F5',
                    'primaryHover' => '#714830',
                    'onPrimary' => '#FFFFFF',
                    'cardBg' => 'rgba(255, 255, 255, 0.85)',
                    'cardBorder' => 'rgba(92, 128, 245, 0.25)',
                    'glassBg' => 'rgba(211, 224, 228, 0.5)',
                    'textMuted' => '#714830',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
            [
                'name' => 'Augmented Reality (AR)',
                'slug' => 'augmented-reality',
                'is_active' => false,
                'config' => [
                    'bodyBackground' => 'linear-gradient(to bottom right, #ADB3BC, #777E89, #5B636E, #1C222D)',
                    'bodyColor' => '#ADB3BC',
                    'primary' => '#5B636E',
                    'primaryHover' => '#383F4C',
                    'onPrimary' => '#FFFFFF',
                    'cardBg' => 'rgba(145, 153, 164, 0.35)',
                    'cardBorder' => 'rgba(173, 179, 188, 0.4)',
                    'glassBg' => 'rgba(145, 153, 164, 0.3)',
                    'textMuted' => '#ADB3BC',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
            [
                'name' => 'App Interface Wireframes',
                'slug' => 'app-wireframes',
                'is_active' => false,
                'config' => [
                    'bodyBackground' => 'linear-gradient(to bottom right, #FAFAFA, #EAEAEA, #DBDADA)',
                    'bodyColor' => '#A8A3A3',
                    'primary' => '#EAAAB2',
                    'primaryHover' => '#A8A3A3',
                    'onPrimary' => '#A8A3A3',
                    'cardBg' => 'rgba(255, 255, 255, 0.9)',
                    'cardBorder' => 'rgba(234, 170, 178, 0.4)',
                    'glassBg' => 'rgba(234, 234, 234, 0.5)',
                    'textMuted' => '#A8A3A3',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
            [
                'name' => 'Husky Walk in Autumn',
                'slug' => 'husky-walk-autumn',
                'is_active' => false,
                'config' => [
                    'bodyBackground' => 'linear-gradient(to bottom right, #D6CBCB, #A597A0, #6F5D65, #5A4442)',
                    'bodyColor' => '#D6CBCB',
                    'primary' => '#867887',
                    'primaryHover' => '#5A4442',
                    'onPrimary' => '#FFFFFF',
                    'cardBg' => 'rgba(166, 151, 160, 0.4)',
                    'cardBorder' => 'rgba(214, 203, 203, 0.4)',
                    'glassBg' => 'rgba(166, 151, 160, 0.35)',
                    'textMuted' => '#D6CBCB',
                    'fontFamily' => 'Inter, system-ui, -apple-system, sans-serif',
                ],
            ],
            [
                'name' => 'Serene Winter Mountain Lake',
                'slug' => 'winter-mountain-lake',
                'is_active' => false,
                'config' => [
                    'bodyBackground' => 'linear-gradient(to bottom right, #C9D0D9, #9EB3BC, #516D74, #2E4B4E)',
                    'bodyColor' => '#C9D0D9',
                    'primary' => '#516D74',
                    'primaryHover' => '#2E4B4E',
                    'onPrimary' => '#FFFFFF',
                    'cardBg' => 'rgba(158, 179, 188, 0.35)',
                    'cardBorder' => 'rgba(201, 208, 217, 0.4)',
                    'glassBg' => 'rgba(158, 179, 188, 0.3)',
                    'textMuted' => '#C9D0D9',
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
