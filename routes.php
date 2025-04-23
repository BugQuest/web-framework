<?php


use BugQuest\Framework\Controllers\Admin\DashboardController;
use BugQuest\Framework\Models\Route;
use BugQuest\Framework\Models\RouteGroup;
use BugQuest\Framework\Services\Admin;

new RouteGroup(
    name: 'admin',
    _prefix: "/admin",
    _routes: [
        new Route(
            name: 'dashboard',
            _slug: '/',
            _callback: DashboardController::class . '::index',
            _methods: ['GET'],
        )
    ],
    _middlewares: [
//                    AdminAuthMiddleware::class
    ]
)->register();