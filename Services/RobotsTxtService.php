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
                    $currentAgent = $value !== '' ? $value : '*'; // fallback sécurité
                    self::$_entries[$currentAgent] ??= [];
                    continue; // **très important** : on saute l'ajout du User-agent dans les règles
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
        self::validateEntries();

        $lines = [];

        foreach (self::$_entries as $agent => $rules) {
            // Si on est sur les entrées globales (clé "*"), vérifier s'il y a besoin d'un User-agent
            $needsUserAgent = $agent === '*' && !empty($rules);

            if ($needsUserAgent) {
                $lines[] = "User-agent: *";
            } elseif ($agent !== '*') {
                $lines[] = "User-agent: $agent";
            }

            foreach ($rules as [$directive, $value]) {
                if ($directive === 'User-agent') {
                    // On ignore car géré par $agent
                    continue;
                }

                $lines[] = "$directive: $value";
            }

            if (!empty($rules)) {
                $lines[] = ''; // ligne vide après chaque groupe
            }
        }

        $content = implode(PHP_EOL, $lines);
        return self::setContent(trim($content));
    }


    public static function addEntry(string $userAgent, string $directive, string $value): bool
    {
        $userAgent = trim($userAgent);
        $directive = trim($directive);
        $value = trim($value);

        if (!self::isValidDirective($directive))
            return false;

        self::$_entries[$userAgent][] = [$directive, $value];
        return true;
    }

    public static function getEntries(): array
    {
        return self::$_entries;
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

    public static function isValidDirective(string $directive): bool
    {
        return in_array($directive, self::$_validDirectives, true);
    }

    public static function validateEntries(): void
    {
        foreach (self::$_entries as $agent => $rules) {
            if (!is_string($agent) || trim($agent) === '') {
                throw new \Exception("Invalid user-agent detected.");
            }

            foreach ($rules as [$directive, $value]) {
                if (!self::isValidDirective($directive)) {
                    throw new \Exception("Invalid directive detected: " . htmlspecialchars($directive));
                }

                if (!is_string($value)) {
                    throw new \Exception("Invalid value detected for directive: " . htmlspecialchars($directive));
                }
            }
        }
    }

}
