<?php

namespace BugQuest\Framework\Services;

class DiscordNotifier
{
    private const COOLDOWN   = 300; // secondes entre deux notifs pour la même erreur
    private const GLOBAL_MAX = 10;  // max notifications par heure toutes erreurs confondues

    public static function notify(\Throwable $e): void
    {
        $webhookUrl = env('DISCORD_WEBHOOK_URL', '');
        if (!$webhookUrl || env('APP_ENV') !== 'production') return;

        if (!self::isDiscordWebhook($webhookUrl)) return;

        if (!self::checkGlobalRate()) return;

        $hash     = substr(hash('sha256', $e->getMessage() . $e->getFile() . $e->getLine()), 0, 16);
        $coolFile = BQ_STORAGE_DIR . '/logs/.discord_' . $hash . '.json';
        $count    = 1;
        $now      = time();

        if (file_exists($coolFile)) {
            $lock = fopen($coolFile, 'r+');
            if ($lock && flock($lock, LOCK_EX)) {
                $data = json_decode(stream_get_contents($lock), true);
                flock($lock, LOCK_UN);
                fclose($lock);
                if ($data && ($now - ($data['last'] ?? 0)) < self::COOLDOWN) {
                    // Encore dans le cooldown : incrémenter le compteur silencieusement
                    $data['count'] = ($data['count'] ?? 1) + 1;
                    $data['last']  = $now;
                    file_put_contents($coolFile, json_encode($data), LOCK_EX);
                    return;
                }
                // Cooldown expiré : reporter avec le nombre d'occurrences accumulées
                $count = ($data['count'] ?? 1) + 1;
            }
        }

        file_put_contents($coolFile, json_encode(['count' => 1, 'first' => $now, 'last' => $now]), LOCK_EX);

        $url     = self::buildSafeUrl();
        $trace   = self::cleanTrace($e->getTraceAsString());
        $class   = get_class($e);
        $message = mb_substr($e->getMessage(), 0, 300);
        $file    = str_replace(BQ_ROOT . '/', '', $e->getFile());
        $line    = $e->getLine();
        $title   = '🚨 ' . $class . ($count > 1 ? " ×{$count}" : '');

        $payload = [
            'username' => env('APP_NAME', 'App') . ' Errors',
            'embeds'   => [[
                'title'       => $title,
                'description' => "```\n{$message}\n```",
                'color'       => 0xe53e3e,
                'fields'      => [
                    ['name' => '📄 Fichier', 'value' => "`{$file}:{$line}`",   'inline' => false],
                    ['name' => '🌐 URL',     'value' => "`{$url}`",            'inline' => false],
                    ['name' => '🔍 Trace',   'value' => "```\n{$trace}\n```", 'inline' => false],
                ],
                'footer'    => ['text' => env('APP_ENV', 'unknown')],
                'timestamp' => date('c'),
            ]],
        ];

        self::sendWebhook($webhookUrl, $payload);
    }

    private static function isDiscordWebhook(string $url): bool
    {
        $parsed = parse_url($url);
        if (!$parsed || ($parsed['scheme'] ?? '') !== 'https') return false;
        $host = $parsed['host'] ?? '';
        return $host === 'discord.com' || $host === 'discordapp.com';
    }

    private static function checkGlobalRate(): bool
    {
        $rateFile = BQ_STORAGE_DIR . '/logs/.discord_ratelimit.json';
        $bucket   = date('Y-m-d\TH');
        $data     = ['bucket' => '', 'count' => 0];

        if (file_exists($rateFile)) {
            $raw  = file_get_contents($rateFile);
            $data = json_decode($raw, true) ?? $data;
        }

        if ($data['bucket'] !== $bucket) {
            $data = ['bucket' => $bucket, 'count' => 0];
        }

        if ($data['count'] >= self::GLOBAL_MAX) return false;

        $data['count']++;
        file_put_contents($rateFile, json_encode($data), LOCK_EX);
        return true;
    }

    private static function buildSafeUrl(): string
    {
        $host = $_SERVER['HTTP_HOST'] ?? '';
        if (!preg_match('/^[a-zA-Z0-9.\-]+(:\d+)?$/', $host)) {
            $host = 'unknown-host';
        }

        if (!$host) return 'cli';

        $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $path   = mb_substr(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/', 0, 200);

        return $scheme . '://' . $host . $path;
    }

    private static function cleanTrace(string $trace): string
    {
        $lines = array_slice(explode("\n", $trace), 0, 8);
        $lines = array_map(fn($l) => str_replace(BQ_ROOT . '/', '', $l), $lines);
        return mb_substr(implode("\n", $lines), 0, 900);
    }

    private static function sendWebhook(string $url, array $payload): void
    {
        $json = json_encode($payload);
        $ch   = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $json,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 5,
            CURLOPT_PROTOCOLS      => CURLPROTO_HTTPS,
        ]);
        curl_exec($ch);
        curl_close($ch);
    }
}
