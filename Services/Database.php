<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Models\Database\Meta;
use BugQuest\Framework\Router;
use Illuminate\Database\Capsule\Manager;
use BugQuest\Framework\Controllers\InstallController;
use BugQuest\Framework\Models\Route;


class Database
{
    public static function init(): void
    {
        $manager = new Manager;

        $manager->addConnection([
            'driver' => env('DB_DRIVER', 'mysql'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'database' => env('DB_DATABASE', 'bugquest'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_general_ci'),
            'prefix' => env('DB_PREFIX', 'bqwf_'),
        ]);

        $manager->setAsGlobal();
        $manager->bootEloquent();


        if (!self::isInstalled() && !str_starts_with(Router::test(), 'framework.assets')) {
            $route = new Route(
                name: 'install',
                _slug: '/install',
                _callback: InstallController::class . '::index',
                _methods: ['GET', 'POST']
            )->register();

            if (!str_starts_with($_SERVER['REQUEST_URI'], '/install'))
                $route->redirect();
        }
    }

    public static function isInstalled(): bool
    {
        try {
            return Meta::where('key', 'installed')->where('value', 'true')->exists();
        } catch (\Throwable $e) {
            return false;
        }
    }
}
