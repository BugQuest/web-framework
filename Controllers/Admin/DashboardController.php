<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Models\Response;

class DashboardController
{
    public static function index(): Response
    {
        return Response::view('@framework/admin/dashboard.twig');
    }
}