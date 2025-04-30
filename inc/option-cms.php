<?php

use BugQuest\Framework\Models\OptionBlock;
use BugQuest\Framework\Models\OptionPage;
use BugQuest\Framework\Services\Admin;

$page = new OptionPage(
    title: '🧰 CMS',
    group: 'cms',
);

$page->registerBlock(
    new OptionBlock(
        type: 'page',
        key: 'homepage',
        label: __("Page d'accueil", 'bugquest', 'fr'),
        options: [
            'description' => __("Sélectionnez la page d'accueil de votre site", 'admin', 'fr'),
        ],
        group: 'Global',
    )
);

$page->registerBlock(
    new OptionBlock(
        type: 'string',
        key: 'main_domain',
        label: __("Domaine principal", 'bugquest', 'fr'),
        options: [
            'description' => __("Definir le domaine principal de votre site", 'admin', 'fr'),
        ],
        group: 'Global',
    )
);

Admin::addOptionPage($page);