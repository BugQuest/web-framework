<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Debug\RouterDebugger;
use BugQuest\Framework\Router;
use BugQuest\Framework\Services\View;

class DebugController
{
    public static function routes()
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

        return View::render('@framework/admin/debug/routes.twig', [
            'routes' => $routes
        ]);
    }
}