<?php

namespace BugQuest\Framework\Services;

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
        'config' => [
            'name' => 'Config',
            'icon' => '🔧',
            'route' => null,
            'children' => []
        ],
        'debug' => [
            'name' => 'Debug',
            'icon' => '🐞',
            'route' => null,
            'children' => []
        ]
    ];

    public static array $_pages = [];

    public static function addMenu(string $name, string $icon, string $route, array $children = []): void
    {
        //check if menu already exists
        if (key_exists($name, self::$_menus))
            throw new \Exception("Menu $name already exists");

        $id = StringHelper::sanitize_title($name);

        self::$_menus[$id] = [
            'name' => $name,
            'icon' => $icon,
            'route' => $route,
            'children' => $children
        ];
    }

    public static function addSubmenu(string $parent, string $name, string $icon, string $route): void
    {
        $id_parent = StringHelper::sanitize_title($parent);
        //check if parent menu exists
        if (!key_exists($id_parent, self::$_menus))
            throw new \Exception("Parent menu $parent does not exist");

        $id = StringHelper::sanitize_title($name);
        //check if submenu already exists
        if (key_exists($id, self::$_menus[$parent]['children']))
            throw new \Exception("Submenu $name already exists for $parent");

        self::$_menus[$parent]['children'][$id] = [
            'name' => $name,
            'icon' => $icon,
            'route' => $route
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
        self::addSubmenu(
            parent: 'debug',
            name: 'Routes',
            icon: '🗺️',
            route: self::addPage('Debug - Routes', \BugQuest\Framework\Controllers\Admin\DebugController::class . '::routes')
        );
    }
}