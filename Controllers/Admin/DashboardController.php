<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Services\View;

class DashboardController
{
    public static function index()
    {
        return View::render('@framework/admin/dashboard.twig', [
            'memory_usage' => round(memory_get_usage() / 1024 / 1024, 2),
            'php_version' => PHP_VERSION,
        ]);
    }
}