<?php

namespace BugQuest\Framework\Models;

use BugQuest\Framework\Router;

class RouteGroup
{
    /**
     * @param string $name
     * @param string $_prefix
     * @param Route[] $_routes
     * @param array $_middlewares
     */
    public function __construct(
        public readonly string $name,
        private string         $_prefix,
        private readonly array $_routes = [],
        private readonly array $_middlewares = []
    )
    {
        if (empty($this->_prefix))
            throw new \InvalidArgumentException('Prefix cannot be empty');

        $this->_prefix = rtrim($this->_prefix, '/');

        foreach ($this->_routes as $route) {
            foreach ($this->_middlewares as $middleware)
                $route->withMiddleware($middleware);
            $this->add($route);
        }
    }

    public function add(Route $route): Route
    {
        // On ajoute automatiquement le préfixe au slug
        $slug = $this->_prefix . '/' . ltrim($route->getSlug(), '/');
        $name = $this->name . '.' . $route->name;

        return new Route(
            name: $name,
            _slug: $slug,
            _callback: $route->getCallable(true),
            _methods: $route->getMethods(),
            _middlewares: array_merge($this->_middlewares, $route->getMiddlewares()),
            group: $this,
            _cache_key: $route->getCacheKey(),
            _cache_group: $route->getCacheGroup(),
            _cache_ttl: $route->getCacheTTL()
        )->register();
    }

    public function register(): void
    {
        Router::addGroup($this);
    }
}
