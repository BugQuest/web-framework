<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Services\Assets;
use BugQuest\Framework\Services\Image;
use BugQuest\Framework\Services\Locale;
use BugQuest\Framework\Services\View;

abstract class ImagesController
{
    public static function index(): Response
    {
        Assets::add(
            group: 'admin',
            id: 'js:admin:options:images',
            url: '/framework/assets/js/admin-options-images',
            type: 'js',
            dependencies: ['js:admin'],
            isLocalUrl: true,
        );

        $imagick_installed = extension_loaded('imagick');
        $webp_supported = function_exists('imagewebp');
        $avif_supported = function_exists('imageavif');
        $image_sizes = Image::getSizes();

        $compression_methods = [
            [
                'value' => '',
                'label' => __('Aucune', 'admin', 'fr'),
            ]
        ];

        if ($webp_supported)
            $compression_methods[] = ['value' => 'webp', 'label' => __('WebP', 'admin', 'fr')];

        if ($avif_supported)
            $compression_methods[] = ['value' => 'avif', 'label' => __('AVIF', 'admin', 'fr')];

        $locale = Locale::getLocale();
        $help_path = '@framework/admin/config/images-help-' . $locale . '.twig';
        if (!View::hasTemplate($help_path))
            $help_path = '@framework/admin/config/images-help-fr.twig';


        return Response::view('@framework/admin/config/images.twig', [
            'imagick_installed' => $imagick_installed,
            'webp_supported' => $webp_supported,
            'avif_supported' => $avif_supported,
            'compression_methods' => json_encode($compression_methods),
            'help_path' => $help_path,
            'sizes' => $image_sizes,
        ]);
    }
}