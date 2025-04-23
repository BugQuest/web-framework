<?php

use BugQuest\Framework\Debug;
use BugQuest\Framework\Router;
use BugQuest\Framework\Services\Admin;
use BugQuest\Framework\Services\Hooks;
use BugQuest\Framework\Services\View;
use BugQuest\Framework\Services\Database;

if (!defined('BQ_CACHE_SECRET'))
    define('BQ_CACHE_SECRET', env('BQ_CACHE_SECRET', 'changeme-this-should-be-very-secret'));

set_exception_handler(function ($e) {
    http_response_code(500);

    // Nettoie tout ce qui a pu être envoyé avant l’erreur
    if (ob_get_level())
        ob_clean();

    echo View::renderError('@framework/error/500.twig', $e);

    exit;
});

//if (php_sapi_name() !== 'cli')
//    Debug::start();

Hooks::runAction('kernel.start');

if (file_exists(BQ_ROOT . '/routes.php'))
    require_once BQ_ROOT . '/routes.php';

if (file_exists(BQ_FRAMEWORK_PATH . '/routes.php'))
    require_once BQ_FRAMEWORK_PATH . '/routes.php';

Admin::registerPages();
Hooks::runAction('kernel.after.admin.register.pages');

BugQuest\Framework\Services\Locale::init();

//load inc folder
if (is_dir(BQ_FRAMEWORK_PATH . '/inc'))
    foreach (glob(BQ_FRAMEWORK_PATH . '/inc/*.php') as $file)
        require_once $file;

Database::init();

if ($result = Router::dispatch()) {
    if (is_a($result, BugQuest\Framework\Models\Response::class))
        $result->send();
    else if (is_array($result) || is_object($result)) {
        header('Content-Type: application/json');
        echo json_encode($result);
    } else
        echo $result;

    Debug::saveStatus();

    return;
}
die('Where da hell am i ?');

