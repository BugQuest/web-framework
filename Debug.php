<?php

namespace BugQuest\Framework;

use BugQuest\Framework\Debug\RouterDebugger;
use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Services\Auth;
use BugQuest\Framework\Services\Cache;

class Debug
{
    private static array $_logs = [];

    public static function log(string $group, string $key, int|float|string $value): void
    {
        if (!Auth::isAdmin())
            return;

        if (!isset(self::$_logs[$group]))
            self::$_logs[$group] = [];

        self::$_logs[$group][$key] = $value;
    }

    public static function saveStatus(): void
    {
        $user = Auth::user();

        if (!$user || !$user->isAdmin())
            return;

        if (!defined('BQ_START_TIME') || !defined('BQ_START_MEMORY'))
            return;

        $end_time = microtime(true);
        $end_memory = memory_get_usage(true);
        $time = number_format(($end_time - BQ_START_TIME) * 1000, 2);
        $memory = number_format(($end_memory - BQ_START_MEMORY) / 1024 / 1024, 2);
        $memoryPeak = number_format(memory_get_peak_usage(true) / 1024 / 1024, 2);


        self::$_logs['Metrics'] = [
            'PHP Version' => PHP_VERSION,
            '⏱️ Time' => $time . 'ms',
            '💾 Memory' => $memory . 'MB',
            '💾 Memory Peek' => $memoryPeak . 'MB',
        ];


        Cache::put('metrics.' . $user->id, self::$_logs, 300, 'debug');
    }

    public static function metrics(): Response
    {
        $user = Auth::user();

        if (!$user || !$user->isAdmin())
            return Response::json401();

        if ($metrics = Cache::get('metrics.' . $user->id, null, 'debug', true))
            return Response::json($metrics);

        return Response::json404('Metrics not found');
    }
}
