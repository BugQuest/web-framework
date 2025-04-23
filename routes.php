<?php


use BugQuest\Framework\Controllers\Admin\DashboardController;
use BugQuest\Framework\Controllers\InstallController;
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

new RouteGroup(
    name: 'auth',
    _prefix: "/auth",
    _routes: [
        new Route(
            name: 'login',
            _slug: '/login',
            _methods: ['GET', 'POST'],
            _callback: AuthController::class . '::login'
        ),
        new Route(
            name: 'logout',
            _slug: '/logout',
            _methods: ['GET'],
            _callback: AuthController::class . '::logout'
        )
    ]
)->register();