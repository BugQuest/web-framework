<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Models\Response;

abstract class RobotsTxtService
{
    private static array $_entries = [];

    private static array $_validDirectives = [
        'User-agent', 'Disallow', 'Allow', 'Crawl-delay', 'Sitemap', 'Host',
    ];

    public static function path(): string
    {
        $folder = storage('seo');
        if (!is_dir($folder))
            mkdir($folder, 0755, true);
        
        return $folder . DS . 'robots.txt';
    }

    public static function exists(): bool
    {
        return file_exists(self::path());
    }

    public static function load(): void
    {
        self::$_entries = [];

        if (!self::exists()) {
            return;
        }

        $lines = file(self::path(), FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        $currentAgent = null;

        foreach ($lines as $line) {
            $line = trim($line);

            // Skip comments
            if (str_starts_with($line, '#')) {
                continue;
            }

            if (strpos($line, ':') !== false) {
                [$directive, $value] = array_map('trim', explode(':', $line, 2));

                if (!in_array($directive, self::$_validDirectives, true)) {
                    continue; // skip unknown directives
                }

                if ($directive === 'User-agent') {
                    $currentAgent = $value;
                    self::$_entries[$currentAgent] ??= [];
                }

                if ($currentAgent !== null) {
                    self::$_entries[$currentAgent][] = [$directive, $value];
                } else {
                    // global entries like Sitemap or Host
                    self::$_entries['*'][] = [$directive, $value];
                }
            }
        }
    }

    public static function save(): bool
    {
        $lines = [];

        foreach (self::$_entries as $agent => $rules) {
            if ($agent !== '*') {
                $lines[] = "User-agent: $agent";
            }
            foreach ($rules as [$directive, $value]) {
                if ($agent === '*' && $directive === 'User-agent') {
                    continue; // avoid duplication
                }
                $lines[] = "$directive: $value";
            }
            $lines[] = ''; // separate sections
        }

        $content = implode(PHP_EOL, $lines);
        return self::setContent(trim($content));
    }

    public static function getEntries(): array
    {
        return self::$_entries;
    }

    public static function addEntry(string $userAgent, string $directive, string $value): bool
    {
        $userAgent = trim($userAgent);
        $directive = trim($directive);
        $value = trim($value);

        if (!self::_isValidDirective($directive)) {
            return false;
        }

        self::$_entries[$userAgent][] = [$directive, $value];
        return true;
    }

    public static function editEntry(string $userAgent, int $index, string $directive, string $value): bool
    {
        if (!isset(self::$_entries[$userAgent][$index])) {
            return false;
        }

        if (!self::_isValidDirective($directive)) {
            return false;
        }

        self::$_entries[$userAgent][$index] = [trim($directive), trim($value)];
        return true;
    }

    public static function deleteEntry(string $userAgent, int $index): bool
    {
        if (!isset(self::$_entries[$userAgent][$index])) {
            return false;
        }

        unset(self::$_entries[$userAgent][$index]);
        self::$_entries[$userAgent] = array_values(self::$_entries[$userAgent]); // reindex
        return true;
    }

    public static function clear(): void
    {
        self::$_entries = [];
    }

    public static function delete(): bool
    {
        if (self::exists()) {
            return unlink(self::path());
        }
        return false;
    }

    public static function getContent(): string
    {
        if (!self::exists())
            return '';

        return file_get_contents(self::path());
    }

    public static function setContent(string $content): bool
    {
        return file_put_contents(self::path(), $content) !== false;
    }

    private static function _isValidDirective(string $directive): bool
    {
        return in_array($directive, self::$_validDirectives, true);
    }
}
