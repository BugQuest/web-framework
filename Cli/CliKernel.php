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
        $manager = new Manager();
        $manager->addConnection([
            'driver'    => env('DB_DRIVER', 'mysql'),
            'host'      => env('DB_HOST', '127.0.0.1'),
            'database'  => env('DB_DATABASE', 'bugquest'),
            'username'  => env('DB_USERNAME', 'root'),
            'password'  => env('DB_PASSWORD', ''),
            'charset'   => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_general_ci'),
            'prefix'    => env('DB_PREFIX', ''),
        ]);
        $manager->setAsGlobal();
        $manager->bootEloquent();

        $container = new Container();
        Facade::setFacadeApplication($container);
        $container->instance('db', $manager->getDatabaseManager());
    }
}
