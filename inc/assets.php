<?php

use BugQuest\Framework\Services\Assets;

Assets::registerDist(BQ_PUBLIC_DIR . '/cms/dist');
Assets::registerDist(BQ_PUBLIC_DIR . '/cms/admin/dist');

Assets::addCss(
    group: 'admin',
    url: '/css/admin.css'
);

Assets::addJs(
    group: 'admin',
    url: '/js/admin.js',
);

Assets::addCss(
    group: 'admin-light',
    url: '/css/admin-light.css',
);

Assets::addJs(
    group: 'global',
    url: '/js/global.js',
);

Assets::addFonts(
    group: 'global',
    url: 'https://fonts.googleapis.com/css?family=Orbitron'
);