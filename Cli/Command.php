<?php

namespace BugQuest\Framework\Cli;

abstract class Command
{
    public string $name        = '';
    public string $description = '';
    public string $usage       = '';

    abstract public function handle(array $args): int;

    protected function line(string $text = ''): void
    {
        echo $text . PHP_EOL;
    }

    protected function info(string $text): void
    {
        echo "\033[32m" . $text . "\033[0m" . PHP_EOL;
    }

    protected function error(string $text): void
    {
        echo "\033[31m[ERROR] " . $text . "\033[0m" . PHP_EOL;
    }

    protected function warn(string $text): void
    {
        echo "\033[33m[WARN] " . $text . "\033[0m" . PHP_EOL;
    }

    protected function title(string $text): void
    {
        echo "\033[1;36m" . $text . "\033[0m" . PHP_EOL;
    }

    protected function success(string $text): void
    {
        echo "\033[1;32m✓ " . $text . "\033[0m" . PHP_EOL;
    }

    protected function ask(string $question, string $default = ''): string
    {
        $hint = $default ? " [\033[33m{$default}\033[0m]" : '';
        echo $question . $hint . ': ';
        $input = trim(fgets(STDIN));
        return $input !== '' ? $input : $default;
    }

    protected function secret(string $question): string
    {
        echo $question . ': ';
        if (PHP_OS_FAMILY !== 'Windows') {
            system('stty -echo');
        }
        $input = trim(fgets(STDIN));
        if (PHP_OS_FAMILY !== 'Windows') {
            system('stty echo');
        }
        echo PHP_EOL;
        return $input;
    }

    protected function confirm(string $question, bool $default = false): bool
    {
        $hint = $default ? '[Y/n]' : '[y/N]';
        echo $question . ' ' . $hint . ': ';
        $input = strtolower(trim(fgets(STDIN)));
        if ($input === '') return $default;
        return in_array($input, ['y', 'yes', 'o', 'oui'], true);
    }

    protected function option(array $args, string $key, mixed $default = null): mixed
    {
        foreach ($args as $arg) {
            if (str_starts_with($arg, "--{$key}="))
                return substr($arg, strlen("--{$key}="));
            if ($arg === "--{$key}")
                return true;
        }
        return $default;
    }

    protected function hasOption(array $args, string $key): bool
    {
        return $this->option($args, $key, null) !== null;
    }

    protected function table(array $headers, array $rows): void
    {
        $widths = array_map('strlen', $headers);

        foreach ($rows as $row) {
            foreach (array_values($row) as $i => $cell) {
                $widths[$i] = max($widths[$i] ?? 0, strlen((string) $cell));
            }
        }

        $sep = '+' . implode('+', array_map(fn($w) => str_repeat('-', $w + 2), $widths)) . '+';
        echo $sep . PHP_EOL;

        $header = '|';
        foreach ($headers as $i => $h) {
            $header .= ' ' . str_pad($h, $widths[$i]) . ' |';
        }
        echo "\033[1m" . $header . "\033[0m" . PHP_EOL;
        echo $sep . PHP_EOL;

        foreach ($rows as $row) {
            $line = '|';
            foreach (array_values($row) as $i => $cell) {
                $line .= ' ' . str_pad((string) $cell, $widths[$i] ?? 0) . ' |';
            }
            echo $line . PHP_EOL;
        }
        echo $sep . PHP_EOL;
    }
}
