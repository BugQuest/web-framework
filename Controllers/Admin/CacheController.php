<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Services\Cache;
use BugQuest\Framework\Services\View;

class CacheController
{
    public static function index(): Response
    {
        return Response::view('@framework/admin/cache/index.twig', [
            'groups' => self::getGroups()
        ]);
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
        $items = Cache::list($group);

        foreach ($items as $item)
            Cache::forget($item['key'], $group);

        return Response::jsonSuccess("Groupe de cache supprimé : {$group}");
    }

    private static function getGroups(): Response
    {
        $base = storage('cache');
        $groups = [];

        foreach (scandir($base) as $file) {
            if ($file === '.' || $file === '..') continue;
            if (is_dir($base . DS . $file)) $groups[] = $file;
        }

        return Response::json($groups);
    }
}