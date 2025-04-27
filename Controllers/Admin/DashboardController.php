<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Services\MigrationManager;

class DashboardController
{
    public static function index(): Response
    {
        return Response::view('@framework/admin/dashboard.twig',
            [
                'migrationUpdateAvailable' => MigrationManager::hasPendingMigrations(),
            ]
        );
    }
}