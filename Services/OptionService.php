<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Models\Database\Option;

class OptionService
{
    private static array $_cache = [];

    public static function get(string $group, ?string $key = null, $default = null)
    {
        if ($key === null) {
            if (!isset(self::$_cache[$group]))
                self::loadGroup($group);

            return self::$_cache[$group];
        }

        if (!isset(self::$_cache[$group]) || !isset(self::$_cache[$group][$key]))
            self::loadValue($group, $key);

        return self::$_cache[$group][$key] ?? $default;
    }

    public static function set(string $group, string $key, string $type, $value): void
    {
        //check if the entry already exists
        $option = Option::where('group', $group)->where('key', $key)->first();

        if ($option) {
            $option->type = $type;
            $option->value = $value;
        } else {
            $option = new Option();
            $option->group = $group;
            $option->key = $key;
            $option->type = $type;
            $option->value = $value;
        }

        $option->prepareValue();
        $option->save();
        $option->parseValue();

        self::$_cache[$group][$key] = $option->value;
    }

    public static function setGroup(string $group, array $data): void
    {
        foreach ($data as $item) {
            $key = $item['key'] ?? null;
            $value = $item['value'] ?? null;
            $type = $item['type'] ?? null;

            if (!$key || !$value || !$type) continue;

            self::set($group, $key, $type, $value);
        }
    }

    public static function all(string $group): array
    {
        if (!isset(self::$_cache[$group]))
            self::loadGroup($group);


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

        /** @var Option $option */
        foreach ($options as $option) {
            $option->parseValue();
            self::$_cache[$group][$option->key] = $option->value;
        }
    }

    private static function loadValue(string $group, string $key): void
    {
        if (!isset(self::$_cache[$group]))
            self::$_cache[$group] = [];

        $option = Option::where('group', $group)->where('key', $key)->first();
        if ($option) {
            $option->parseValue();
            self::$_cache[$group][$option->key] = $option->value;
            return;
        }

        self::$_cache[$group][$key] = null;
    }
}
