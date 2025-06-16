<?php

use BugQuest\Framework\Models\OptionBlock;
use BugQuest\Framework\Models\OptionPage;
use BugQuest\Framework\Services\Admin;

$page = new OptionPage(
    title: '🗺️ Map',
    group: 'map',
    menuParent: 'config',
    menuIcon: '🗺️',
    menuTitle: 'Map',
    submenu: 'map',
);

$page->registerBlock(
    new OptionBlock(
        type: 'string',
        key: 'default_layer',
        label: __("Url du layer par default", 'admin', 'fr'),
        defaultValue: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        options: [
            'description' => __("Url de layer de la carte de type /{z}/{x}/{y}.png", 'admin', 'fr'),
        ],
        group: 'Map',
    )
);

$page->registerBlock(
    new OptionBlock(
        type: 'string',
        key: 'default_attribution',
        label: __("Attribution par defaut", 'admin', 'fr'),
        defaultValue: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        options: [
            'description' => __("Attribution par defaut des layers de la carte", 'admin', 'fr'),
        ],
        group: 'Map',
    )
);

$page->registerBlock(
    new OptionBlock(
        type: 'int',
        key: 'default_zoom',
        label: __("Zoom par defaut", 'admin', 'fr'),
        defaultValue: 20,
        options: [
            'description' => __("Zoom par defaut de la carte", 'admin', 'fr'),
        ],
        group: 'Map',
    )
);

$page->registerBlock(
    new OptionBlock(
        type: 'vector2',
        key: 'default_center',
        label: __("Centre par defaut", 'admin', 'fr'),
        defaultValue: ['x' => 0, 'y' => 0],
        options: [
            'description' => __("Centre par defaut de la carte x = longitude, y = latitude", 'admin', 'fr'),
        ],
        group: 'Map',
    )
);

$page->registerBlock(
    new OptionBlock(
        type: 'vector2',
        key: 'default_marker_size',
        label: __("Taille des markers (px)", 'admin', 'fr'),
        defaultValue: ['x' => 32, 'y' => 32],
        options: [
            'description' => __("Taille par defaut des markers en pixel", 'admin', 'fr'),
        ],
        group: 'Map',
    )
);

$page->registerBlock(
    new OptionBlock(
        type: 'vector2',
        key: 'default_marker_anchor',
        label: __("Ancre des markers (px)", 'admin', 'fr'),
        defaultValue: ['x' => 32, 'y' => 32],
        options: [
            'description' => __("Ancre par defaut des markers en pixel", 'admin', 'fr'),
        ],
        group: 'Markers',
    )
);

$page->registerBlock(
    new OptionBlock(
        type: 'vector2',
        key: 'default_popup_anchor',
        label: __("Ancre de la popup (px)", 'admin', 'fr'),
        defaultValue: ['x' => 32, 'y' => 32],
        options: [
            'description' => __("Ancre par defaut des popups des markers en pixel", 'admin', 'fr'),
        ],
        group: 'Markers',
    )
);


Admin::addOptionPage($page);