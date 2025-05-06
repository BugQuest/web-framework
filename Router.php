<?php

namespace BugQuest\Framework;

use BugQuest\Framework\Models\Route;
use BugQuest\Framework\Models\RouteGroup;
use BugQuest\Framework\Models\Database\Page;
use BugQuest\Framework\Services\OptionService;
use BugQuest\Framework\Services\PageService;
use mysql_xdevapi\Exception;

abstract class Router
{
    private static ?Route $_currentRoute = null;
    /**
     * @var Route[]
     */
    private static array $_routes = [];

    /**
     * @var RouteGroup[]
     */
    private static array $_groups = [];

    /**
     * Ajoute une route à la liste
     *
     * @param Route $route
     */
    public static function add(Route $route): void
    {
        self::$_routes[] = $route;
    }

    public static function addGroup(RouteGroup $group): void
    {
        self::$_groups[] = $group;
    }

    public static function getCurrentRoute(): ?Route
    {
        return self::$_currentRoute;
    }

    /**
     * Dispatch une URI vers une route correspondante
     *
     * @return mixed
     * @throws \Exception
     */
    public static function dispatch(): mixed
    {
//        $uri = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $fallback = null;

        //tentative de résolution de la homepage, get option homepage
        $pageRouteHome = self::getRoute('home');
        if ($pageRouteHome && $pageRouteHome->acceptsMethod($method)) {
            //check if url is home
            if ($pageRouteHome->matchUri($uri) !== null) {
                try {
                    /**
                     * @var Page|null $homepage
                     */
                    if ($homepage = OptionService::get('cms', 'homepage'))
                        if ($homepage->isPublished())
                            PageService::setCurrent($homepage);
                } catch (\Exception $e) {
                    // Si l'option n'existe pas, on ignore l'erreur
                    // surement la bdd n'est pas encore initialisée
                }

                self::$_currentRoute = $pageRouteHome;
                return self::runMiddlewares(
                    $pageRouteHome->getMiddlewares(),
                    fn() => $pageRouteHome->process()
                );
            }
        }

        foreach (self::$_routes as $route) {
            if ($route->isFallback()) {
                $fallback = $route;
                continue;
            }

            if (!$route->acceptsMethod($method)) continue;

            $params = $route->matchUri($uri);

            if ($params !== null) {
                self::$_currentRoute = $route;
                return self::runMiddlewares(
                    $route->getMiddlewares(),
                    fn() => $route->process($params)
                );
            }
        }

        // Tentative de résolution via le modèle Page si route 'page' existe
        $pageRoute = self::getRoute('page');
        if ($pageRoute && $pageRoute->acceptsMethod($method)) {
            //Remove first slash
            $uri = ltrim($uri, '/');
            //remove last slash if exists
            $uri = rtrim($uri, '/');
            $page = Page::where('slug', $uri)->where('status', 'published')->first();

            if ($page) {
                self::$_currentRoute = $pageRoute;
                PageService::setCurrent($page);
                return self::runMiddlewares(
                    $pageRoute->getMiddlewares(),
                    fn() => $pageRoute->process(['page' => $page])
                );
            }
        }

        // Fallback ou 404
        if ($fallback) {
            http_response_code(404);
            return self::runMiddlewares(
                $fallback->getMiddlewares(),
                fn() => $fallback->process()
            );
        }

        http_response_code(404);
        return "404 Not Found – Aucune route ne correspond à l’URI [$uri]";
    }

    public static function test(): ?string
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        foreach (self::$_routes as $route) {
            if (!$route->acceptsMethod($method)) continue;

            if ($route->matchUri($uri) !== null)
                return $route->name;
        }

        return null; // Aucune route ne correspond
    }


    private static function runMiddlewares(array $middlewares, callable $finalHandler): mixed
    {
        $stack = array_reverse($middlewares);

        $next = $finalHandler;

        foreach ($stack as $middleware)
            $next = fn() => (new $middleware)->handle($next);


        return $next();
    }

    /**
     * Retourne la liste des routes
     * @return Route[]
     */
    public static function getRoutes(): array
    {
        return self::$_routes;
    }

    public static function getRoute(string $name): ?Route
    {
        foreach (self::$_routes as $route)
            if ($route->name === $name)
                return $route;

        return null;
    }

    public static function redirect(string $name)
    {
        $route = self::getRoute($name);

        if ($route === null) {
            throw new \Exception("La route [$name] n'existe pas");
        }

        header('Location: ' . $route->getSlug());
        exit;
    }

    public static function getGroups(): array
    {
        return self::$_groups;
    }

    public static function getGroup(string $name): ?RouteGroup
    {
        foreach (self::$_groups as $group)
            if ($group->name === $name)
                return $group;

        return null;
    }

    /**
     * Vide toutes les routes (utile pour les tests)
     */
    public static function clear(): void
    {
        self::$_routes = [];
    }
}