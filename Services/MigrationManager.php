<?php

namespace BugQuest\Framework\Services;

use Illuminate\Database\Capsule\Manager;

class MigrationManager
{
    protected static string $migrationsPath = BQ_FRAMEWORK_PATH . DS . 'Migrations';

    public static function migrateAll(): void
    {
        self::ensureMigrationTableExists();

        $applied = self::getAppliedMigrations();

        foreach (self::getAllMigrationClasses() as $class => $file) {
            if (!in_array($class, $applied)) {
                require_once $file;
                (new $class())->up();
                self::markMigrationApplied($class);
            }
        }
    }

    public static function hasPendingMigrations(): bool
    {
        $applied = self::getAppliedMigrations();
        $all = array_keys(self::getAllMigrationClasses());
        return count(array_diff($all, $applied)) > 0;
    }

    protected static function ensureMigrationTableExists(): void
    {
        if (!Manager::schema()->hasTable('migrations')) {
            Manager::schema()->create('migrations', function ($table) {
                $table->id();
                $table->string('migration');
                $table->timestamps();
            });
        }
    }

    protected static function getAppliedMigrations(): array
    {
        return Manager::table('migrations')->pluck('migration')->toArray();
    }

    protected static function markMigrationApplied(string $class): void
    {
        Manager::table('migrations')->insert([
            'migration' => $class,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ]);
    }

    protected static function getAllMigrationClasses(): array
    {
        $classes = [];

        foreach (glob(self::$migrationsPath . '/*.php') as $file) {
            require_once $file;
            $basename = basename($file, '.php');
            $split = explode('_', $basename);
            //get the last part of the split
            $className = array_pop($split);
            $classes[$className] = $file;
        }

        return $classes;
    }
}
