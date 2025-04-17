<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Models\Database\I18nMissing;

class Locale
{
    private static string $default = 'fr';
    private static string $cookieName = 'bq_locale';
    private static string $locale;
    private static array $paths = [BQ_FRAMEWORK_PATH . DS . 'Locale'];
    private static array $loaded = [];
    private static array $translations = [];

    public static function init(): void
    {
        self::$locale = $_COOKIE[self::$cookieName] ?? self::$default;
    }

    public static function setLocale(string $locale): void
    {
        self::$locale = $locale;
        self::$loaded = [];
        self::$translations = [];

        // Définit le cookie pour 1 an
        setcookie(self::$cookieName, $locale, [
            'expires' => time() + 60 * 60 * 24 * 365,
            'path' => '/',
            'secure' => !empty($_SERVER['HTTPS']),
            'httponly' => false,
            'samesite' => 'Lax',
        ]);
    }

    public static function getLocale(): string
    {
        return self::$locale ?? self::$default;
    }

    public static function addPath(string $path): void
    {
        self::$paths[] = rtrim($path, '/');
        self::$loaded = [];
        self::$translations = [];
    }

    public static function translate(string $original, string $domain = 'BugQuest', string $str_locale = 'fr', array $replacements = []): string
    {
        $locale = self::getLocale();

        if ($locale == $str_locale)
            return $original;

        if (!isset(self::$loaded[$domain]))
            self::loadDomain($domain);

        $translations = self::$translations[$domain] ?? [];
        $translated = $translations[$original] ?? null;

        if ($translated === null) {
            self::saveMissingKey($domain, $str_locale, $original);
            return $original;
        }

        // Appliquer les remplacements {variable}
        foreach ($replacements as $k => $v)
            $translated = str_replace("{{$k}}", $v, $translated);

        return $translated;
    }

    public static function getDomain(string $domain): array
    {
        if (!isset(self::$loaded[$domain]))
            self::loadDomain($domain);

        return self::$translations[$domain] ?? [];
    }

    private static function loadDomain(string $domain): void
    {
        $translations = [];

        foreach (self::$paths as $basePath) {
            $file = "$basePath/" . self::$locale . "/$domain.json";
            if (file_exists($file)) {
                $json = file_get_contents($file);
                $data = json_decode($json, true);
                if (is_array($data)) {
                    $translations = array_merge_recursive($translations, $data);
                }
            }
        }

        self::$translations[$domain] = $translations;
        self::$loaded[$domain] = true;
    }

    private static function saveMissingKey(string $domain, string $locale, string $key): void
    {
        if (!env('LOCALE_COLLECT', false)) {
            return;
        }

        I18nMissing::firstOrCreate([
            'domain' => $domain,
            'locale' => $locale,
            'keyname' => $key,
        ]);
    }
}
