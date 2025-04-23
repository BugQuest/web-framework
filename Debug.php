<?php

namespace BugQuest\Framework;

use BugQuest\Framework\Debug\RouterDebugger;

class Debug
{
    private static float $startTime;
    private static int $startMemory;

    public static function start(): void
    {
        self::$startTime = microtime(true);
        self::$startMemory = memory_get_usage(true);
    }

    public static function isEnabled(string $key = ''): bool
    {
        $debug = $_ENV['APP_DEBUG'] ?? '';
        if ($debug === 'true') return true;

        if ($key && str_contains($debug, $key)) {
            return true;
        }

        return false;
    }

    public static function panel(string $uri): void
    {
        if (!self::isEnabled()) return;

        $routerDebug = self::isEnabled('route') ? RouterDebugger::show($uri) : '';

        $time = number_format((microtime(true) - self::$startTime) * 1000, 2);
        $memory = number_format((memory_get_usage(true) - self::$startMemory) / 1024 / 1024, 2);
        $memoryPeak = number_format(memory_get_peak_usage(true) / 1024 / 1024, 2);

        echo <<<HTML
        <div style="margin-top:2em; border-top: 2px dashed #ccc; padding-top:1em;">
            <details open>
                <summary style="cursor:pointer; font-family:sans-serif; font-weight:bold;">
                    🐞 Debug Panel – {$time}ms / {$memory}Mo (peak: {$memoryPeak}Mo)
                </summary>
                {$routerDebug}
            </details>
        </div>
        HTML;
    }
}
