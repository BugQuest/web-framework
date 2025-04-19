<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Controllers\Admin\DebugController;
use BugQuest\Framework\Controllers\Admin\GlobalStyleController;
use BugQuest\Framework\Controllers\Admin\ImagesController;
use BugQuest\Framework\Controllers\Admin\MediasController;
use BugQuest\Framework\Controllers\Admin\PageBuilderController;
use BugQuest\Framework\Controllers\Admin\PageListController;
use BugQuest\Framework\Helpers\StringHelper;
use BugQuest\Framework\Models\Route;
use BugQuest\Framework\Router;

abstract class Admin
{
    public static array $_menus = [
        'dashboard' => [
            'name' => 'Dashboard',
            'icon' => '📊',
            'route' => 'admin.dashboard',
            'children' => []
        ],
    ];

    public static array $_pages = [];

    public static function addMenu(string $name, ?string $icon, ?string $route, ?string $url = null, array $children = []): void
    {
        if (key_exists($name, self::$_menus))
            throw new \Exception("Menu $name already exists");

        $id = StringHelper::sanitize_title($name);

        self::$_menus[$id] = [
            'name' => $name,
            'icon' => $icon,
            'route' => $route,
            'url' => $url,
            'children' => $children
        ];
    }


    public static function addSubmenu(string $parent, string $name, ?string $icon, ?string $route = null, ?string $url = null): void
    {
        $id_parent = StringHelper::sanitize_title($parent);

        if (!key_exists($id_parent, self::$_menus))
            throw new \Exception("Parent menu $parent does not exist");

        $id = StringHelper::sanitize_title($name);

        if (key_exists($id, self::$_menus[$id_parent]['children']))
            throw new \Exception("Submenu $name already exists for $parent");

        self::$_menus[$id_parent]['children'][$id] = [
            'name' => $name,
            'icon' => $icon,
            'route' => $route,
            'url' => $url
        ];
    }

    public static function addPage(string $name, $callback): string
    {
        $id = StringHelper::sanitize_title($name);
        //check if page already exists
        if (in_array($id, self::$_pages))
            throw new \Exception("Page $id already exists");

        self::$_pages[] = $id;

        $group = Router::getGroup('admin');
        $route = $group->add(
            new Route(
                name: $id,
                _slug: '/' . $id,
                _callback: $callback,
                _methods: ['GET'],
            )
        );

        return $route->name;
    }

    public static function renderMenu(): string
    {
        return View::render('@framework/admin/partials/menu.twig', [
            'menus' => Hooks::runFilter('admin.menus', self::$_menus),
        ]);
    }

    public static function registerPages(): void
    {
        self::addMenu(
            name: 'Pages',
            icon: '📄',
            route: self::addPage('Pages - List', PageListController::class . '::index')
        );

        self::addMenu(
            name: 'Medias',
            icon: '🖼️',
            route: self::addPage('Config - Medias', MediasController::class . '::index')
        );

        self::addMenu(
            name: 'Config',
            icon: '🔧',
            route: null
        );

        self::addMenu(
            name: 'Debug',
            icon: '🐞',
            route: null
        );

        self::addSubmenu(
            parent: 'debug',
            name: 'Routes',
            icon: '🗺️',
            route: self::addPage('Debug - Routes', DebugController::class . '::routes')
        );

        self::addSubmenu(
            parent: 'config',
            name: 'Images',
            icon: '🖼️',
            route: self::addPage('Config - Images', ImagesController::class . '::index')
        );

        //add page
        self::addSubmenu(
            parent: 'pages',
            name: 'New Page',
            icon: '🛠️',
            url: '/admin/page/',
        );
    }
}