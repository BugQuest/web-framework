<?php

namespace BugQuest\Framework;

use BugQuest\Framework\Models\Route;
use BugQuest\Framework\Models\RouteGroup;

abstract class Router
{
    /**
     * @var Route[]
     */
    private static array $routes = [];

    /**
     * @var RouteGroup[]
     */
    private static array $groups = [];

    /**
     * Ajoute une route à la liste
     *
     * @param Route $route
     */
    public static function add(Route $route): void
    {
        self::$routes[] = $route;
    }

    public static function addGroup(RouteGroup $group): void
    {
        self::$groups[] = $group;
    }

    /**
     * Dispatch une URI vers une route correspondante
     *
     * @return mixed
     * @throws \Exception
     */
    public static function dispatch(): mixed
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $fallback = null;

        foreach (self::$routes as $route) {
            if ($route->isFallback()) {
                $fallback = $route;
                continue;
            }

            if (!$route->acceptsMethod($method)) continue;

            $params = $route->matchUri($uri);

            if ($params !== null) {
                return self::runMiddlewares(
                    $route->getMiddlewares(),
                    fn() => $route->process($params)
                );
            }
        }

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
        return self::$routes;
    }

    public static function getRoute(string $name): ?Route
    {
        foreach (self::$routes as $route)
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
        return self::$groups;
    }

    public static function getGroup(string $name): ?RouteGroup
    {
        foreach (self::$groups as $group)
            if ($group->name === $name)
                return $group;

        return null;
    }

    /**
     * Vide toutes les routes (utile pour les tests)
     */
    public static function clear(): void
    {
        self::$routes = [];
    }
}