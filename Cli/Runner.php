<?php

namespace BugQuest\Framework\Cli;

class Runner
{
    /** @var Command[] */
    private static array $commands = [];

    public static function run(array $argv, string $commandsPath): void
    {
        self::discover($commandsPath);

        $commandName = $argv[1] ?? 'help';
        $args        = array_slice($argv, 2);

        if (in_array($commandName, ['help', '--help', '-h'], true)) {
            self::showHelp();
            return;
        }

        foreach (self::$commands as $command) {
            if ($command->name === $commandName) {
                exit($command->handle($args) ?? 0);
            }
        }

        echo "\033[31m[ERROR] Commande inconnue : {$commandName}\033[0m" . PHP_EOL;
        echo "Lancez \033[33mphp bq-cli help\033[0m pour voir les commandes disponibles." . PHP_EOL;
        exit(1);
    }

    private static function discover(string $path): void
    {
        if (!is_dir($path)) return;

        foreach (glob($path . '/*.php') as $file) {
            require_once $file;
            $class = self::classFromFile($file);
            if ($class && class_exists($class) && is_subclass_of($class, Command::class)) {
                $instance = new $class();
                if ($instance->name !== '') {
                    self::$commands[] = $instance;
                }
            }
        }

        usort(self::$commands, fn($a, $b) => strcmp($a->name, $b->name));
    }

    private static function classFromFile(string $file): ?string
    {
        $content = file_get_contents($file);
        if (!preg_match('/^namespace\s+([^\s;]+)/m', $content, $ns)) return null;
        if (!preg_match('/^class\s+(\w+)/m', $content, $cls)) return null;
        return $ns[1] . '\\' . $cls[1];
    }

    private static function showHelp(): void
    {
        echo PHP_EOL;
        echo "\033[1;33m  ╔══════════════════════════════════╗\033[0m" . PHP_EOL;
        echo "\033[1;33m  ║  BugQuest CLI  —  bq-cli         ║\033[0m" . PHP_EOL;
        echo "\033[1;33m  ╚══════════════════════════════════╝\033[0m" . PHP_EOL;
        echo PHP_EOL;
        echo "  Usage : \033[36mphp bq-cli <commande> [options]\033[0m" . PHP_EOL;
        echo PHP_EOL;

        if (empty(self::$commands)) {
            echo "  Aucune commande trouvée dans App/Commands/." . PHP_EOL;
            echo PHP_EOL;
            return;
        }

        echo "  \033[1mCommandes disponibles :\033[0m" . PHP_EOL;
        echo PHP_EOL;

        $groups = [];
        foreach (self::$commands as $cmd) {
            $group = strstr($cmd->name, ':', true) ?: '_';
            $groups[$group][] = $cmd;
        }

        foreach ($groups as $group => $cmds) {
            if ($group !== '_') {
                echo "  \033[33m{$group}\033[0m" . PHP_EOL;
            }
            foreach ($cmds as $cmd) {
                $usage = $cmd->usage ? " \033[90m{$cmd->usage}\033[0m" : '';
                echo sprintf("    \033[32m%-28s\033[0m %s%s\n", $cmd->name, $cmd->description, $usage);
            }
            echo PHP_EOL;
        }
    }
}
