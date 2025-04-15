<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Models\Database\Meta;

abstract class MetaService
{
    private static $_loaded = [];

    public static function update(string $key, $value): mixed
    {
        /** @var Meta $meta */
        $meta = Meta::where('key', $key)->first();

        if ($meta) {
            $meta->value = $value;
            $meta->prepare();
            $meta->save();
        } else {
            $meta = new Meta();
            $meta->key = $key;
            $meta->value = $value;
            $meta->prepare();
            $meta->save();
        }

        return $value;
    }

    public static function get(string $key, bool $reload = false): mixed
    {
        if (isset(self::$_loaded[$key]) && !$reload)
            return self::$_loaded[$key];

        $meta = Meta::where('key', $key)->first();

        if ($meta) {
            $meta->parse();
            self::$_loaded[$key] = $meta->value;
            return $meta->value;
        }

        return null;
    }

    public static function delete(string $key): void
    {
        $meta = Meta::where('key', $key)->first();

        if ($meta) {
            $meta->delete();
            if (isset(self::$_loaded[$key]))
                unset(self::$_loaded[$key]);
        }
    }
}