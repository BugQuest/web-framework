<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Router;

class DebugController
{
    public static function routes(): Response
    {
        $routes = [];
        foreach (Router::getRoutes() as $route) {
            $doc = $route->getDocumentation();
            $paramsInfos = [];
            foreach ($doc['parameters'] as $index => $p) {
                $label = "{$p['name']}:{$p['type']}";
                if ($p['optional']) {
                    $label .= '?';
                }
                $value = $matchParams[$index] ?? null;
                $paramsInfos[] = "$label=" . var_export($value, true);
            }

            $doc['methods'] = implode(', ', $doc['methods']);
            $doc['params'] = $paramsInfos ? implode('<br>', $paramsInfos) : '-';
            $routes[] = $doc;
        }

        return Response::view('@framework/admin/debug/routes.twig', [
            'routes' => $routes
        ]);
    }
}