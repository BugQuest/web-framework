<?php

use BugQuest\Framework\Models\OptionBlock;
use BugQuest\Framework\Models\OptionPage;
use BugQuest\Framework\Services\Admin;
use BugQuest\Framework\Services\Image;
use BugQuest\Framework\Services\Locale;
use BugQuest\Framework\Services\View;

$page = new OptionPage(
    title: 'Options - Images',
    group: 'images',
    menuParent: 'config',
    menuIcon: '🖼️',
    menuTitle: 'Images',
    submenu: 'images',
    _header: function () {
        $imagick_installed = extension_loaded('imagick');
        $webp_supported = function_exists('imagewebp');
        $avif_supported = function_exists('imageavif');
        $image_sizes = Image::getSizes();

        $locale = Locale::getLocale();
        $help_path = '@framework/admin/config/images-help-' . $locale . '.twig';
        if (!View::hasTemplate($help_path))
            $help_path = '@framework/admin/config/images-help-fr.twig';

        return View::render('@framework/admin/config/images.twig', [
            'imagick_installed' => $imagick_installed,
            'webp_supported' => $webp_supported,
            'avif_supported' => $avif_supported,
            'help_path' => $help_path,
            'sizes' => $image_sizes,
        ]);
    }
);

$page->registerBlock(
    new OptionBlock(
        type: 'select',
        key: 'compression_method',
        label: __("Méthode de compression", 'admin', 'fr'),
        options: function () {
            $compression_methods = [
                [
                    'value' => '',
                    'label' => __('Aucune', 'admin', 'fr'),
                ]
            ];
            if (function_exists('imagewebp'))
                $compression_methods[] = ['value' => 'webp', 'label' => __('WebP', 'admin', 'fr')];
            if (function_exists('imageavif'))
                $compression_methods[] = ['value' => 'avif', 'label' => __('AVIF', 'admin', 'fr')];
            return [
                'description' => __("Sélectionnez la méthode de compression des images", 'admin', 'fr'),
                'options' => $compression_methods,
            ];
        },
        group: 'Global',
    )
);

$page->registerBlock(
    new OptionBlock(
        type: 'media',
        key: 'placeholder',
        label: __("Image de remplacement", 'admin', 'fr'),
        options: [
            'description' => __("Sélectionnez l'image de remplacement par défaut", 'admin', 'fr'),
            'mimeTypes' => ['image/jpeg', 'image/png'],
        ],
        group: 'Global',
    )
);

Admin::addOptionPage($page);