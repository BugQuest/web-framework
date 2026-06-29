<?php

use BugQuest\Framework\Debug;
use BugQuest\Framework\Router;
use BugQuest\Framework\Services\Admin;
use BugQuest\Framework\Services\DiscordNotifier;
use BugQuest\Framework\Services\Hooks;
use BugQuest\Framework\Services\View;
use BugQuest\Framework\Services\Database;

if (!defined(‘BQ_CACHE_SECRET’))
    define(‘BQ_CACHE_SECRET’, env(‘BQ_CACHE_SECRET’, ‘changeme-this-should-be-very-secret’));

set_exception_handler(function (\Throwable $e) {
    http_response_code(500);

    while (ob_get_level()) ob_end_clean();

    DiscordNotifier::notify($e);

    if (env(‘APP_DEBUG’)) {
        echo View::renderError(‘@framework/error/500.twig’, $e);
        exit;
    }

    Hooks::runAction(‘kernel.error’, $e);

    if (!headers_sent()) {
        header(‘Content-Type: text/html; charset=utf-8’);
        echo ‘<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Erreur</title></head>’
            . ‘<body style="font-family:sans-serif;text-align:center;padding:4rem;color:#374151">’
            . ‘<h2>Une erreur est survenue</h2><p><a href="/">Retour à l\’accueil</a></p>’
            . ‘</body></html>’;
    }

    exit;
});

register_shutdown_function(function () {
    $err = error_get_last();
    if ($err && in_array($err[‘type’], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        DiscordNotifier::notify(new \ErrorException($err[‘message’], 0, $err[‘type’], $err[‘file’], $err[‘line’]));
    }
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

Hooks::runAction('kernel.after.inc');

Database::init();

Hooks::runAction('kernel.after.database');

if ($result = Router::dispatch()) {
    if (is_a($result, BugQuest\Framework\Models\Response::class))
        $result->send();
    else if (is_array($result) || is_object($result)) {
        header('Content-Type: application/json');
        echo json_encode($result);
    } else
        echo $result;

    $currentRoute = Router::getCurrentRoute();
    if ($currentRoute) {

        if (str_starts_with($currentRoute->name, 'framework.assets'))
            return;

        if (str_starts_with($currentRoute->name, 'admin.api'))
            return;

        Debug::saveStatus();
    }


    return;
}
die('Where da hell am i ?');

