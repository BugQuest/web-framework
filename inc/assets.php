<?php

use BugQuest\Framework\Services\Assets;

Assets::add(
    group: 'admin',
    id: 'css:admin',
    url: '/framework/assets/css/admin',
    type: 'css',
    isLocalUrl: true,
);

Assets::add(
    group: 'admin',
    id: 'js:admin',
    url: '/framework/assets/js/admin',
    type: 'js',
    isLocalUrl: true,
);

Assets::add(
    group: 'admin-light',
    id: 'css:admin:light',
    url: '/framework/assets/css/admin-light',
    type: 'css',
    isLocalUrl: true,
);

Assets::add(
    group: 'global',
    id: 'js:global',
    url: '/framework/assets/js/global',
    type: 'js',
    isLocalUrl: true,
);

Assets::addFonts(
    group: 'admin',
    url: 'https://fonts.googleapis.com/css?family=Orbitron'
);

Assets::addFonts(
    group: 'global',
    url: 'https://fonts.googleapis.com/css?family=Orbitron'
);