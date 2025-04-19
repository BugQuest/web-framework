<?php

namespace BugQuest\Framework\Models;

use BugQuest\Framework\Router;

class RouteGroup
{
    /**
     * @param string $name Nom du groupe (utilisé dans le nom des routes)
     * @param string $_prefix Préfixe d'URL (ex: /admin)
     * @param Route[] $_routes Liste initiale des routes
     * @param array $_middlewares Liste des middlewares communs
     * @param string|null $_cacheKey Préfixe de clé cache pour les routes
     * @param string $_cacheGroup Nom du groupe cache
     * @param int $_cacheTtl Durée de vie du cache (secondes)
     */
    public function __construct(
        public readonly string   $name,
        private string           $_prefix,
        private readonly array   $_routes = [],
        private readonly array   $_middlewares = [],
        private readonly ?string $_cacheKey = null,
        private readonly string  $_cacheGroup = 'group',
        private readonly int     $_cacheTtl = 3600,
    )
    {
        if (empty($this->_prefix))
            throw new \InvalidArgumentException('Prefix cannot be empty');

        $this->_prefix = rtrim($this->_prefix, '/');

        foreach ($this->_routes as $route)
            $this->add($route);
    }

    public function add(Route $route): Route
    {
        $slug = $this->_prefix . '/' . ltrim($route->getSlug(), '/');
        $name = $this->name . '.' . $route->name;

        return new Route(
            name: $name,
            _slug: $slug,
            _callback: $route->getCallable(),
            _methods: $route->getMethods(),
            _middlewares: $this->resolveMiddlewares($route),
            group: $this,
            _cache_key: $this->resolveCacheKey($route),
            _cache_group: $this->resolveCacheGroup($route),
            _cache_ttl: $this->resolveCacheTtl($route),
        )->register();
    }

    public function register(): void
    {
        Router::addGroup($this);
    }

    private function resolveMiddlewares(Route $route): array
    {
        return array_merge($this->_middlewares, $route->getMiddlewares());
    }

    private function resolveCacheKey(Route $route): ?string
    {
        return $route->getCacheKey()
            ?? ($this->_cacheKey !== null ? $this->_cacheKey . '.' . $route->name : null);
    }

    private function resolveCacheGroup(Route $route): string
    {
        return $route->getCacheGroup() ?? $this->_cacheGroup;
    }

    private function resolveCacheTtl(Route $route): int
    {
        return $route->getCacheTTL() ?? $this->_cacheTtl;
    }
}
