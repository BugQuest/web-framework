<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Debug;
use BugQuest\Framework\Helpers\CallbackHelper;

class Cache
{
    public static function put(string $key, $value, ?int $ttl = 3600, string $group = 'default'): void
    {
        self::ensureDirectory($group);
        $time = time();
        $payload = [
            'expires_at' => $ttl ? $time + $ttl : null,
            'value' => $value,
            'created_at' => $time,
        ];

        file_put_contents(self::path($key, $group), self::export($payload));
    }

    public static function forever(string $key, $callback, string $group = 'default')
    {
        return self::remember($key, null, $callback, $group);
    }

    public static function get(string $key, $default = null, string $group = 'default', bool $ignoreAdmin = false)
    {
        if (Auth::isAdmin() && !$ignoreAdmin)
            return $default;

        $path = self::path($key, $group);
        if (!file_exists($path)) return $default;

        $payload = self::import($path);
        if (!$payload) return $default;

        if ($payload['expires_at'] && time() > $payload['expires_at']) {
            self::forget($key, $group);
            return $default;
        }

        return $payload['value'];
    }

    public static function remember(string $key, ?int $ttl, $callback, string $group = 'default')
    {
        $cached = self::get($key, null, $group);
        if ($cached !== null) return $cached;

        $value = call_user_func_array(CallbackHelper::parse($callback), []);
        self::put($key, $value, $ttl, $group);
        return $value;
    }

    public static function forget(string $key, string $group = 'default'): void
    {
        $path = self::path($key, $group);
        if (file_exists($path)) unlink($path);
    }

    public static function all(string $group = 'default'): array
    {
        $files = glob(self::getCacheDir($group) . '/*.php');
        $data = [];

        foreach ($files as $file) {
            $payload = self::import($file);
            if (!$payload) continue;

            $key = basename($file, '.php');
            $data[$key] = $payload['value'];
        }

        return $data;
    }

    public static function list(string $group = 'default'): array
    {
        $directory = self::getCacheDir($group);
        if (!is_dir($directory)) return [];

        $items = [];

        foreach (scandir($directory) as $file) {
            if (in_array($file, ['.', '..'])) continue;

            $fullPath = $directory . DS . $file;
            if (is_file($fullPath)) {
                $payload = self::import($fullPath);
                if (!is_array($payload) || !array_key_exists('value', $payload)) continue;

                $items[] = [
                    'key' => basename($file, '.php'),
                    'group' => $group,
                    'created_at' => $payload['created_at'] ?? null,
                    'expires_at' => $payload['expires_at'] ?? null,
                    'size' => filesize($fullPath),
                    'path' => $fullPath,
                    'value' => $payload['value'],
                ];
            }
        }

        return $items;
    }

    // === Internal methods ===

    private static function path(string $key, string $group): string
    {
        return self::getCacheDir($group) . '/' . md5($key) . '.php';
    }

    private static function ensureDirectory(string $group): void
    {
        $dir = self::getCacheDir($group);
        if (!is_dir($dir))
            mkdir($dir, 0777, true);
    }

    private static function getCacheDir(string $group = 'default'): string
    {
        return storage('cache') . DS . $group;
    }

    private static function export(array $data): string
    {
        $data['__signature'] = self::sign($data);

        return "<?php\ndeclare(strict_types=1);\nreturn " . var_export($data, true) . ";";
    }

    private static function import(string $path): array|null
    {
        $payload = @include $path;
        if (!is_array($payload)) {
            @unlink($path); // fichier corrompu ou invalide
            return null;
        }

        $signature = $payload['__signature'] ?? null;
        unset($payload['__signature']);

        if (!$signature || !hash_equals($signature, self::sign($payload))) {
            @unlink($path); // signature invalide = suppression
            return null;
        }

        return $payload;
    }

    private static function sign(array $data): string
    {
        ksort($data); // assure l’ordre pour un hash stable
        return hash_hmac('sha256', serialize($data), BQ_CACHE_SECRET);
    }

    public static function clean(string $group = 'default'): void
    {
        $directory = self::getCacheDir($group);
        if (!is_dir($directory)) return;

        foreach (scandir($directory) as $file) {
            if (in_array($file, ['.', '..'])) continue;

            $path = $directory . DS . $file;
            if (!is_file($path)) continue;

            $payload = @include $path;

            // 1. Fichier invalide ou pas un tableau
            if (!is_array($payload)) {
                @unlink($path);
                continue;
            }

            // 2. Vérification de la signature
            $signature = $payload['__signature'] ?? null;
            $original = $payload;
            unset($original['__signature']);

            if (!$signature || !hash_equals($signature, self::sign($original))) {
                @unlink($path);
                continue;
            }

            // 3. Vérification de l'expiration
            if (isset($payload['expires_at']) && $payload['expires_at'] !== null && time() > $payload['expires_at']) {
                @unlink($path);
                continue;
            }
        }
    }
}
