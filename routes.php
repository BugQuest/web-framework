<?php


use BugQuest\Framework\Controllers\Admin\DashboardController;
use BugQuest\Framework\Controllers\Admin\DebugController;
use BugQuest\Framework\Controllers\Admin\LocaleController;
use BugQuest\Framework\Controllers\Admin\MediasController;
use BugQuest\Framework\Controllers\Admin\OptionController;
use BugQuest\Framework\Controllers\AuthController;
use BugQuest\Framework\Debug;
use BugQuest\Framework\Middleware\AdminAuthMiddleware;
use BugQuest\Framework\Middleware\ApiAuthMiddleware;
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
        ),
        /*
         * Routes pour la gestion des médias
         */
        new Route(
            name: 'medias.upload',
            _slug: '/medias/upload',
            _callback: MediasController::class . '::upload',
            _methods: ['POST']
        ),
        new Route(
            name: 'medias.all',
            _slug: '/medias/all/{page:int?}',
            _callback: MediasController::class . '::all',
            _methods: ['GET']
        ),
        new Route(
            name: 'medias.delete',
            _slug: '/medias/delete/{id:int?}',
            _callback: MediasController::class . '::delete',
            _methods: ['DELETE']
        ),
        new Route(
            name: 'medias.update-meta',
            _slug: '/medias/update-meta/{id:int}',
            _callback: MediasController::class . '::updateMeta',
            _methods: ['POST']
        ),
        new Route(
            name: 'medias.view',
            _slug: '/medias/view/{id:int}',
            _callback: MediasController::class . '::view',
            _methods: ['GET']
        ),
        /*
         * Routes pour la gestion des Media tags
         */
        new Route(
            name: 'medias.tags.all',
            _slug: '/medias/tags/all',
            _callback: MediasController::class . '::getTags',
            _methods: ['GET']
        ),
        new Route(
            name: 'medias.tags.add',
            _slug: '/medias/tags/add',
            _callback: MediasController::class . '::addTag',
            _methods: ['POST']
        ),
        new Route(
            name: 'medias.tags.delete',
            _slug: '/medias/tags/delete/{id:int}',
            _callback: MediasController::class . '::deleteTag',
            _methods: ['DELETE']
        ),
        new Route(
            name: 'medias.tags.set',
            _slug: '/medias/tags/set/{id:int}',
            _callback: MediasController::class . '::setTags',
            _methods: ['POST']
        ),
        new Route(
            name: 'locale.domain.get',
            _slug: '/locale/domain/get/{domain:alpha}',
            _callback: LocaleController::class . '::getDomain',
            _methods: ['GET']
        ),
        /**
         * Options
         */
        new Route(
            name: 'options.get',
            _slug: '/options/get/{group:alpha}/{key:slug?}',
            _callback: OptionController::class . '::get',
            _methods: ['GET']
        ),
        new Route(name: 'options.set',
            _slug: '/options/set/{group:alpha}/{key:slug?}',
            _callback: OptionController::class . '::set',
            _methods: ['POST']
        ),
        new Route(
            name: 'options.delete',
            _slug: '/options/delete/{group:alpha}/{key:slug}',
            _callback: OptionController::class . '::delete',
            _methods: ['DELETE']
        ),
    ],
    _middlewares: [
        AdminAuthMiddleware::class
    ]
)->register();

new RouteGroup(
    name: 'admin.api',
    _prefix: '/admin/api',
    _routes: [
        new Route(
            name: 'debug',
            _slug: '/debug/metrics',
            _callback: Debug::class . '::metrics',
            _methods: ['GET']
        ),
    ],
    _middlewares: [
        ApiAuthMiddleware::class
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