<?php

namespace BugQuest\Framework\Cli;

use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager;
use Illuminate\Support\Facades\Facade;

class CliKernel
{
    /**
     * Bootstrap Eloquent without the HTTP router checks from Database::init().
     * Call this once after bootstrap.php to get a working DB connection in CLI.
     */
    public static function boot(): void
    {
        $driver = env('DB_DRIVER', 'mysql');

        $connection = [
            'driver'   => $driver,
            'host'     => env('DB_HOST', '127.0.0.1'),
            'port'     => env('DB_PORT', $driver === 'pgsql' ? '5432' : '3306'),
            'database' => env('DB_DATABASE', 'bugquest'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'prefix'   => env('DB_PREFIX', ''),
        ];

        if ($driver !== 'pgsql') {
            $connection['charset']   = env('DB_CHARSET', 'utf8mb4');
            $connection['collation'] = env('DB_COLLATION', 'utf8mb4_general_ci');
        } else {
            $connection['charset'] = 'utf8';
            $connection['schema']  = env('DB_SCHEMA', 'public');
        }

        $manager = new Manager();
        $manager->addConnection($connection);
        $manager->setAsGlobal();
        $manager->bootEloquent();

        $container = new Container();
        Facade::setFacadeApplication($container);
        $container->instance('db', $manager->getDatabaseManager());
    }
}
