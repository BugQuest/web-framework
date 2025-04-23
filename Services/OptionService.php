<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Models\Database\Option;

class OptionService
{
    private static array $_cache = [];

    public static function get(string $group, ?string $key = null, $default = null)
    {
        if (!isset(self::$_cache[$group])) {
            self::loadGroup($group);
        }

        if ($key === null) return self::$_cache[$group];

        return self::$_cache[$group][$key] ?? $default;
    }

    public static function set(string $group, string $key, $value): void
    {
        $encoded = json_encode($value);

        Option::updateOrCreate(
            ['group' => $group, 'key' => $key],
            ['value' => $encoded]
        );

        self::$_cache[$group][$key] = $value;
    }

    public static function setGroup(string $group, array $values): void
    {
        foreach ($values as $key => $value)
            self::set($group, $key, $value);
    }

    public static function all(string $group): array
    {
        if (!isset(self::$_cache[$group])) {
            self::loadGroup($group);
        }

        return self::$_cache[$group];
    }

    public static function delete(string $group, string $key): void
    {
        Option::where('group', $group)->where('key', $key)->delete();
        unset(self::$_cache[$group][$key]);
    }

    public static function forget(string $group): void
    {
        unset(self::$_cache[$group]);
    }

    private static function loadGroup(string $group): void
    {
        $options = Option::where('group', $group)->get();
        self::$_cache[$group] = [];

        foreach ($options as $opt) {
            $decoded = json_decode($opt->value, true);
            self::$_cache[$group][$opt->key] = is_null($decoded) ? $opt->value : $decoded;
        }
    }
}
