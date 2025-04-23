<?php


use BugQuest\Framework\Controllers\Admin\DashboardController;
use BugQuest\Framework\Controllers\AuthController;
use BugQuest\Framework\Middleware\AdminAuthMiddleware;
use BugQuest\Framework\Models\Route;
use BugQuest\Framework\Models\RouteGroup;

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
        AdminAuthMiddleware::class
    ]
)->register();

new RouteGroup(
    name: 'auth',
    _prefix: "/auth",
    _routes: [
        new Route(
            name: 'login',
            _slug: '/login',
            _callback: AuthController::class . '::login',
            _methods: ['GET', 'POST']
        ),
        new Route(
            name: 'logout',
            _slug: '/logout',
            _callback: AuthController::class . '::logout',
            _methods: ['GET']
        )
    ]
)->register();