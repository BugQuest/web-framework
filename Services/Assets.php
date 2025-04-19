<?php

namespace BugQuest\Framework\Services;

abstract class Assets
{
    private static array $_groups = [];
    private static array $_distSources = [];

    /**
     * Ajoute un asset CSS
     */
    public static function addCss(string $group, string $url, ?string $id = null, array $attributes = []): void
    {
        self::add($group, $id ?? md5("css:$url"), $url, 'css', $attributes);
    }

    /**
     * Ajoute un asset JS
     */
    public static function addJs(string $group, string $url, ?string $id = null, array $attributes = [], string $position = 'footer'): void
    {
        self::add($group, $id ?? md5("js:$url"), $url, 'js', $attributes, $position);
    }

    /**
     * Ajoute un asset de type "fonts"
     */
    public static function addFonts(string $group, string $url, ?string $id = null, array $attributes = []): void
    {
        self::add($group, $id ?? md5("fonts:$url"), $url, 'fonts', $attributes);
    }

    /**
     * Ajoute un asset générique
     */
    public static function add(
        string  $group,
        string  $id,
        string  $url,
        ?string $type = null,
        array   $attributes = [],
        string  $position = 'footer',
        array   $dependencies = [],
        bool    $isLocalUrl = false
    ): void
    {
        $type ??= self::_guessType($url);
        if (!$type || !in_array($type, ['css', 'js', 'fonts']))
            throw new \InvalidArgumentException("Type d'asset invalide : $type");

        $key = $type === 'js' ? "$id@$position" : $id;

        if (isset(self::$_groups[$group][$type][$key])) return;

        self::$_groups[$group][$type][$key] = [
            'id' => $id,
            'url' => $url,
            'is_local_url' => $isLocalUrl,
            'attributes' => $attributes,
            'position' => $position,
            'dependencies' => $dependencies,
        ];
    }


    /**
     * Enregistre un dossier contenant des assets à exposer (non lié à un groupe)
     */
    public static function registerDist(string $directory, string $prefixUrl = '/dist'): void
    {
        $directory = rtrim($directory, '/');
        $prefixUrl = rtrim($prefixUrl, '/');

        if (!is_dir($directory)) return;

        self::$_distSources[] = [
            'path' => $directory,
            'prefix' => $prefixUrl,
        ];
    }

    public static function renderHeader(string $group): string
    {
        return
            self::_render($group, 'fonts')
            . self::_render($group, 'css')
            . self::_render($group, 'js', 'header');
    }

    public static function renderFooter(string $group): string
    {
        return self::_render($group, 'js', 'footer');
    }

    /**
     * Interne : rend les balises HTML pour un type
     */
    private static function _render(string $group, string $type, ?string $positionFilter = null): string
    {
        $assets = self::$_groups[$group][$type] ?? [];

        // On extrait une liste triée
        $sorted = self::_resolveOrder($assets, $type, $positionFilter);

        $html = '';
        foreach ($sorted as $asset) {
            $url = self::_resolveUrl($asset);
            $html .= self::_renderTag($type, $url, $asset['attributes']) . PHP_EOL;
        }

        return $html;
    }

    private static function _resolveOrder(array $assets, string $type, ?string $position): array
    {
        $graph = [];
        $byId = [];

        foreach ($assets as $key => $asset) {
            if ($type === 'js' && $position && ($asset['position'] ?? 'footer') !== $position) {
                continue;
            }

            $id = $asset['id'];
            $graph[$id] = $asset['dependencies'] ?? [];
            $byId[$id] = $asset;
        }

        $ordered = self::_topoSort($graph);

        return array_map(fn($id) => $byId[$id], $ordered);
    }

    private static function _topoSort(array $graph): array
    {
        $visited = [];
        $result = [];

        $visit = function ($node) use (&$visit, &$visited, &$result, $graph) {
            if (isset($visited[$node])) return;
            $visited[$node] = true;

            foreach ($graph[$node] ?? [] as $dep) {
                $visit($dep);
            }

            $result[] = $node;
        };

        foreach (array_keys($graph) as $node) {
            $visit($node);
        }

        return $result;
    }


    /**
     * Devine le type à partir de l'extension
     */
    private static function _guessType(string $url): ?string
    {
        return match (strtolower(pathinfo($url, PATHINFO_EXTENSION))) {
            'css' => 'css',
            'js' => 'js',
            default => null
        };
    }

    /**
     * Résout l'URL réelle (dist ou absolu)
     */
    private static function _resolveUrl(array $asset): string
    {
        // 1. Si c’est une URL absolue (http://, https://, //)
        if ($asset['is_local_url'] || preg_match('#^(https?:)?//#', $asset['url'])) {
            return $asset['url'];
        }
        // 2. Sinon, on considère que c’est un chemin relatif à un "dist" enregistré
        foreach (self::$_distSources as $source) {
            $fullPath = rtrim($source['path'], '/') . '/' . ltrim($asset['url'], '/');

            if (file_exists($fullPath))
                return str_replace(BQ_PUBLIC_DIR, '', $fullPath);
        }

        // 3. Si rien n’a matché, erreur explicite
        throw new \RuntimeException("Asset introuvable : \"$url\" – non résolu via les dist sources.");
    }


    /**
     * Génère la balise HTML d'un asset
     */
    private static function _renderTag(string $type, string $url, array $attributes): string
    {
        $attrs = '';
        foreach ($attributes as $key => $value) {
            $attrs .= ' ' . htmlspecialchars($key) . '="' . htmlspecialchars($value) . '"';
        }

        return match ($type) {
            'css' => "<link rel=\"stylesheet\" href=\"$url\"$attrs>",
            'js' => "<script src=\"$url\"$attrs></script>",
            'fonts' => "<link rel=\"stylesheet\" href=\"$url\"$attrs>",
        };
    }

    /**
     * Vide les groupes (utile pour les tests)
     */
    public static function clear(): void
    {
        self::$_groups = [];
    }
}
