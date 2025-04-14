<?php

namespace BugQuest\Framework\Debug;

use BugQuest\Framework\Router;

class RouterDebugger
{
    public static function show(string $uri): string
    {
        $routes = Router::getRoutes();

        $out = "";

        $out .= "<style>
            table.router-debug { border-collapse: collapse; width: 100%; margin: 1em 0; font-family: monospace; }
            table.router-debug th, table.router-debug td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
            table.router-debug th { background-color: #f0f0f0; }
            .match-yes { background-color: #d4fcd4; }
            .match-no { background-color: #fdd; }
            .pattern-cell { font-size: 0.85em; color: #666; }
            code { font-size: 0.9em; }
        </style>";

        $out .= "<h2>🛠️ Router Debugger</h2>";
        $out .= "<p><strong>URI testée :</strong> <code>$uri</code></p>";

        $out .= "<table class='router-debug'>";
        $out .= "<thead>
                <tr>
                    <th>Methodes</th>
                    <th>Nom</th>
                    <th>Slug</th>
                    <th>Pattern</th>
                    <th>Match</th>
                    <th>Params</th>
                    <th>Injectés</th>
                    <th>Callback</th>
                </tr>
              </thead>";
        $out .= "<tbody>";

        foreach ($routes as $route) {
            $doc = $route->getDocumentation();
            $matchParams = $route->matchUri($uri);
            $doesMatch = $matchParams !== null;
            $injected = $doesMatch ? $route->getResolvedParameters($matchParams) : [];

            $paramsInfos = [];
            foreach ($doc['parameters'] as $index => $p) {
                $label = "{$p['name']}:{$p['type']}";
                if ($p['optional']) {
                    $label .= '?';
                }
                $value = $matchParams[$index] ?? null;
                $paramsInfos[] = "$label=" . var_export($value, true);
            }

            $out .= "<tr class='" . ($doesMatch ? 'match-yes' : 'match-no') . "'>";
            $out .= "<td>" . implode(', ', $doc['methods']) . "</td>";
            $out .= "<td><code>{$doc['name']}</code></td>";
            $out .= "<td><code>{$doc['slug']}</code></td>";
            $out .= "<td class='pattern-cell'><code>{$doc['regex']}</code></td>";
            $out .= "<td>" . ($doesMatch ? '✅' : '❌') . "</td>";
            $out .= "<td>" . ($paramsInfos ? implode('<br>', $paramsInfos) : '-') . "</td>";
            $out .= "<td>" . ($injected ? implode(', ', array_map(fn($v) => var_export($v, true), $injected)) : '-') . "</td>";
            $out .= "<td><code>{$doc['callback']}</code></td>";
            $out .= "</tr>";
        }

        $out .= "</tbody></table>";

        return $out;
    }
}
