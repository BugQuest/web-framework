<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Services\Assets;
use BugQuest\Framework\Services\Cache;

class CacheController
{
    public static function index(): Response
    {
        Assets::add(
            group: 'admin',
            id: 'js:admin:page:cache',
            url: '/framework/assets/js/admin-page-cache',
            type: 'js',
            dependencies: ['js:admin'],
            isLocalUrl: true,
        );

        return Response::view('@framework/admin/cache/index.twig');
    }

    public static function groups(): Response
    {
        return Response::json(self::getGroupsData());
    }

    public static function list(string $group): Response
    {
        return Response::json(Cache::list($group));
    }

    public static function forget(string $group, string $key): Response
    {
        Cache::forget($key, $group);

        return Response::jsonSuccess("Entrée cache supprimée : {$key}");
    }

    public static function clearGroup(string $group): Response
    {
        return match ($group) {
            'twig' => self::clearTwig(),
            'images' => self::clearImages(),
            default => self::doFlushGroup($group),
        };
    }

    private static function doFlushGroup(string $group): Response
    {
        $items = Cache::list($group);

        foreach ($items as $item)
            Cache::forget($item['key'], $group);

        return Response::jsonSuccess("Groupe cache vidé : {$group}");
    }

    private static function clearTwig(): Response
    {
        self::deleteRecursive(storage('cache/twig'), keepRoot: true);

        return Response::jsonSuccess("Cache Twig vidé");
    }

    private static function clearImages(): Response
    {
        $dir = BQ_ROOT . DS . 'htdocs' . DS . 'cache' . DS . 'images';
        self::deleteRecursive($dir, keepRoot: true);

        return Response::jsonSuccess("Cache images vidé");
    }

    private static function deleteRecursive(string $dir, bool $keepRoot = false): void
    {
        if (!is_dir($dir)) return;

        foreach (scandir($dir) as $item) {
            if ($item === '.' || $item === '..') continue;

            $path = $dir . DS . $item;

            if (is_dir($path))
                self::deleteRecursive($path, keepRoot: false);
            else
                @unlink($path);
        }

        if (!$keepRoot)
            @rmdir($dir);
    }

    private static function getGroupsData(): array
    {
        $base = storage('cache');
        $groups = [];

        foreach (scandir($base) as $file) {
            if ($file === '.' || $file === '..') continue;
            if ($file === 'twig') continue;
            if (is_dir($base . DS . $file)) $groups[] = $file;
        }

        return $groups;
    }
}
