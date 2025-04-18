<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Models\Response;

class DashboardController
{
    public static function index(): Response
    {
        return Response::view('@framework/admin/dashboard.twig', [
            'memory_usage' => round(memory_get_usage() / 1024 / 1024, 2),
            'php_version' => PHP_VERSION,
        ]);
    }
}