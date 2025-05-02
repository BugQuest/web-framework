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

$page->registerBlock(
    new OptionBlock(
        type: 'select',
        key: 'default_language',
        label: __("Langue par défaut", 'bugquest', 'fr'),
        options: function () {
            $options = require BQ_FRAMEWORK_PATH . DS . 'Statics' . DS . 'languages.php';
            $options = array_map(
                function ($code, $data) {
                    return [
                        'value' => $code,
                        'label' => $data['name'],
                    ];
                },
                array_keys($options),
                $options
            );

            return [
                'useSearch' => true,
                'description' => __("Sélectionnez la langue par défaut de votre site", 'admin', 'fr'),
                'options' => $options,
            ];
        },
        group: 'Global',
    )
);

$page->registerBlock(
    new OptionBlock(
        type: 'select',
        key: 'languages',
        label: __("Langues", 'bugquest', 'fr'),
        options: function () {
            $options = require BQ_FRAMEWORK_PATH . DS . 'Statics' . DS . 'languages.php';
            $options = array_map(
                function ($code, $data) {
                    return [
                        'value' => $code,
                        'label' => $data['name'],
                    ];
                },
                array_keys($options),
                $options
            );

            return [
                'isMultiple' => true,
                'useSearch' => true,
                'description' => __("Sélectionnez les langues de votre site", 'admin', 'fr'),
                'options' => $options,
            ];
        },
        group: 'Global',
    )
);

Admin::addOptionPage($page);