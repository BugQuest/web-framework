<?php

use BugQuest\Framework\Debug;
use BugQuest\Framework\Models\Route;
use BugQuest\Framework\Router;
use BugQuest\Framework\Services\Admin;
use BugQuest\Framework\Services\Assets;
use BugQuest\Framework\Services\Hooks;
use BugQuest\Framework\Services\View;
use BugQuest\Framework\Services\Database;

set_exception_handler(function ($e) {
    http_response_code(500);

    // Nettoie tout ce qui a pu être envoyé avant l’erreur
    if (ob_get_level())
        ob_clean();

    echo View::renderError('@framework/error/500.twig', $e);

    exit;
});

if (php_sapi_name() !== 'cli')
    Debug::start();

hooks::runAction('kernel.start');

Assets::registerDist(BQ_PUBLIC_DIR . '/cms/dist');
Assets::registerDist(BQ_PUBLIC_DIR . '/cms/admin/dist');


if (file_exists(BQ_ROOT . '/routes.php'))
    require_once BQ_ROOT . '/routes.php';

//====================== Admin ==========================

if (file_exists(BQ_FRAMEWORK_PATH . '/routes.php'))
    require_once BQ_FRAMEWORK_PATH . '/routes.php';

Database::init();

hooks::addAction(
    hook: 'route.before',
    callback: function (Route $route, array $args) {
        if ($route->group?->name === 'admin') {
            Assets::addCss(
                group: 'admin',
                url: '/css/admin.css'
            );

            Assets::addJs(
                group: 'admin',
                url: '/js/admin.js',
            );
        }
    },
    accepted_args: 2
);

Admin::registerPages();

//====================== Admin ==========================

echo Router::dispatch();

//if (php_sapi_name() !== 'cli')
//    Debug::panel($requestUri);

