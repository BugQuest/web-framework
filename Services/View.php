<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Library\Twig\Extentions\TwigExtention;
use BugQuest\Framework\Models\DebugError;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;

abstract class View
{
    private static ?Environment $twig = null;
    private static array $paths = [
        [
            'path' => BQ_ROOT . '/Framework/Views',
            'namespace' => "framework",
        ],
    ];

    public static function addPath(string $path, string $namespace = null): void
    {
        foreach (self::$paths as $entry)
            if ($entry['path'] === $path && $entry['namespace'] === $namespace)
                return;


        self::$paths[] = compact('path', 'namespace');
    }

    public static function init(): void
    {
        $loader = new FilesystemLoader();

        foreach (self::$paths as $entry)
            if ($entry['namespace'])
                $loader->addPath($entry['path'], $entry['namespace']);
            else
                $loader->addPath($entry['path']);

        self::$twig = new Environment($loader, [
            'cache' =>
                env('APP_DEBUG')
                    ? false
                    : storage('cache/twig'),
            'debug' => env('APP_DEBUG'),
        ]);

        self::$twig->addExtension(new TwigExtention());
    }

    public static function render(string $template, array $context = []): string
    {
        if (!self::$twig)
            self::init();

        return self::$twig->render($template, $context);
    }

    public static function renderError(string $template, \Throwable $e): string
    {
        return self::render($template, [
            'error' => new DebugError($e),
        ]);
    }

    public static function renderJson(array $data): void
    {
        header('Content-Type: application/json');
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function setPaths(array $paths): void
    {
        self::$paths = $paths;
        self::$twig = null; // reset pour reinit
    }

    public static function hasTemplate(string $template): bool
    {
        if (!self::$twig)
            self::init();

        return self::$twig->getLoader()->exists($template);
    }
}