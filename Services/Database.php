<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Models\Database\Meta;
use BugQuest\Framework\Router;
use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager;
use Illuminate\Support\Facades\Facade;
use BugQuest\Framework\Controllers\InstallController;
use BugQuest\Framework\Models\Route;
use Illuminate\Support\Facades\DB;


class Database
{
    public static function init(): void
    {
        $manager = new Manager;

        $driver = env('DB_DRIVER', 'mysql');

        $connection = [
            'driver'   => $driver,
            'host'     => env('DB_HOST', '127.0.0.1'),
            'port'     => env('DB_PORT', $driver === 'pgsql' ? '5432' : '3306'),
            'database' => env('DB_DATABASE', 'bugquest'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'prefix'   => env('DB_PREFIX', 'bqwf_'),
        ];

        // MySQL/MariaDB specific options (not valid for PostgreSQL)
        if ($driver !== 'pgsql') {
            $connection['charset']   = env('DB_CHARSET', 'utf8mb4');
            $connection['collation'] = env('DB_COLLATION', 'utf8mb4_unicode_ci');
        } else {
            // PostgreSQL: schema search path
            $connection['schema']  = env('DB_SCHEMA', 'public');
            $connection['charset'] = 'utf8';
        }

        $manager->addConnection($connection);

        $manager->setAsGlobal();
        $manager->bootEloquent();

        $container = new Container();
        Facade::setFacadeApplication($container);
        $container->instance('db', $manager->getDatabaseManager());

        $route_test = Router::test();

        if (!self::isInstalled() && !str_starts_with($route_test ?? '', 'framework.assets')) {
            $route = new Route(
                name: 'install',
                _slug: '/install',
                _callback: InstallController::class . '::index',
                _methods: ['GET', 'POST']
            )->register();

            if (!str_starts_with($_SERVER['REQUEST_URI'], '/install'))
                $route->redirect();
        }

        if (env('DEBUG_SQL', false))
            DB::connection()->enableQueryLog();
        else
            DB::connection()->disableQueryLog();
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
