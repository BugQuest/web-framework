<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Router;

class DebugController
{
    public static function routes(): Response
    {
        $groups = [];
        $total  = 0;

        foreach (Router::getRoutes() as $route) {
            $doc = $route->getDocumentation();

            // ── Middlewares (noms courts) ─────────────────────────────────
            $doc['middlewares'] = array_map(
                fn($m) => substr(strrchr($m, '\\') ?: $m, 1),
                $route->getMiddlewares()
            );

            // ── Nom court de la classe callback ───────────────────────────
            if (!empty($doc['callback']['class'])) {
                $full = $doc['callback']['class'];
                $doc['callback']['short_class'] = substr(strrchr($full, '\\') ?: $full, 1);
            }

            // ── Slug avec paramètres mis en évidence (HTML safe) ──────────
            $doc['slug_html'] = preg_replace(
                '/\{(\w+)(?::[^}]+)?(\?)?\}/',
                '<em class="route-param">{$1$2}</em>',
                htmlspecialchars($doc['slug'])
            );

            // ── Regroupement par premier segment de l'URL ─────────────────
            $slug  = ltrim($doc['slug'], '/');
            if ($slug === '*') {
                $prefix = '[fallback]';
            } else {
                $first  = explode('/', $slug)[0];
                $prefix = $first !== '' ? '/' . $first : '/';
            }

            $groups[$prefix][] = $doc;
            $total++;
        }

        ksort($groups);

        return Response::view('@framework/admin/debug/routes.twig', [
            'groups' => $groups,
            'total'  => $total,
        ]);
    }
}
