<?php


use BugQuest\Framework\Controllers\Admin\DashboardController;
use BugQuest\Framework\Controllers\Admin\DebugController;
use BugQuest\Framework\Controllers\Admin\LocaleController;
use BugQuest\Framework\Controllers\Admin\MediasController;
use BugQuest\Framework\Controllers\Admin\OptionController;
use BugQuest\Framework\Controllers\Admin\PageBuilderController;
use BugQuest\Framework\Controllers\Admin\PageListController;
use BugQuest\Framework\Controllers\AssetsController;
use BugQuest\Framework\Controllers\AuthController;
use BugQuest\Framework\Debug;
use BugQuest\Framework\Middleware\AdminAuthMiddleware;
use BugQuest\Framework\Middleware\ApiAdminAuthMiddleware;
use BugQuest\Framework\Middleware\PlainAdminAuthMiddleware;
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
        new Route(
            name: 'page.edit',
            _slug: '/page/{id:int?}',
            _callback: PageBuilderController::class . '::edit',
            _methods: ['GET'],
        ),
    ],
    _middlewares: [
        AdminAuthMiddleware::class
    ]
)->register();

new RouteGroup(
    name: 'framework.assets',
    _prefix: '/framework/assets',
    _routes: [
        new Route(
            name: 'js',
            _slug: '/js/{file:slug}',
            _callback: AssetsController::class . '::js',
            _methods: ['GET']
        ),
        new Route(
            name: 'css',
            _slug: '/css/{file:slug}',
            _callback: AssetsController::class . '::css',
            _methods: ['GET']
        ),
        new Route(
            name: 'js',
            _slug: '/js-map/{file:slug}',
            _callback: AssetsController::class . '::jsMap',
            _methods: ['GET']
        ),
        new Route(
            name: 'css',
            _slug: '/css-map/{file:slug}',
            _callback: AssetsController::class . '::cssMap',
            _methods: ['GET']
        ),
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
        /*
         * Medias
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
        new Route(
            name: 'medias.resize',
            _slug: '/medias/resize/{id:int}/{size:slug}',
            _callback: MediasController::class . '::resize',
            _methods: ['GET']
        ),
        new Route(
            name: 'medias.sizes',
            _slug: '/medias/sizes',
            _callback: MediasController::class . '::sizes',
            _methods: ['GET']
        ),
        /*
         * Medias Tags
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
        /*
         * Locale
         */
        new Route(
            name: 'locale.domain.get',
            _slug: '/locale/domain/get/{domain:alpha}',
            _callback: LocaleController::class . '::getDomain',
            _methods: ['GET']
        ),
        /*
         * Page
         */
        new Route(
            name: 'page.builder.load',
            _slug: '/page/load/{id:int}',
            _callback: PageBuilderController::class . '::load',
            _methods: ['GET']
        ),
        new Route(
            name: 'page.builder.save',
            _slug: '/page/save/{id:int?}',
            _callback: PageBuilderController::class . '::save',
            _methods: ['POST']
        ),
        new Route(
            name: 'page.list',
            _slug: '/page/list',
            _callback: PageListController::class . '::list',
            _methods: ['POST']
        ),
        new Route(
            name: 'page.hierachy',
            _slug: '/page/hierachy',
            _callback: PageListController::class . '::hierachy',
            _methods: ['POST']
        ),
    ],
    _middlewares: [
        ApiAdminAuthMiddleware::class
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