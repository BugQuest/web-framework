<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Helpers\CallbackHelper;

class Hooks
{
    private static array $_hooks = [
        'actions' => [],
        'filters' => [],
    ];

    public static function add(string $group, string $hook, callable $callback, int $priority = 10, int $accepted_args = 1): void
    {
        if (!isset(self::$_hooks[$group]))
            throw new \InvalidArgumentException("Groupe de hook invalide : $group");

        self::$_hooks[$group][$hook][] = [
            'callback' => $callback,
            'priority' => $priority,
            'accepted_args' => $accepted_args,
        ];
    }

    public static function addAction(string $hook, callable $callback, int $priority = 10, int $accepted_args = 1): void
    {
        self::add('actions', $hook, $callback, $priority, $accepted_args);
    }

    public static function addFilter(string $hook, callable $callback, int $priority = 10, int $accepted_args = 1): void
    {
        self::add('filters', $hook, $callback, $priority, $accepted_args);
    }

    public static function runAction(string $hook, ...$args): void
    {
        self::execute('actions', $hook, $args);
    }

    public static function runFilter(string $hook, mixed $value, ...$args): mixed
    {
        return self::execute('filters', $hook, array_merge([$value], $args));
    }

    private static function execute(string $group, string $hook, array $args): mixed
    {
        if (!isset(self::$_hooks[$group][$hook]))
            return $group === 'filters' ? $args[0] ?? null : null;

        $callbacks = self::$_hooks[$group][$hook];
        usort($callbacks, fn($a, $b) => $a['priority'] <=> $b['priority']);

        foreach ($callbacks as $entry) {
            $cb = $entry['callback'];
            $accepted = $entry['accepted_args'];

            // Appel avec seulement les arguments nécessaires
            $calledArgs = array_slice($args, 0, $accepted);

            $result = call_user_func_array(CallbackHelper::parse($cb), $calledArgs);

            // Les filters renvoient la valeur modifiée à chaque tour
            if ($group === 'filters')
                $args[0] = $result;
        }

        return $group === 'filters' ? $args[0] : null;
    }

    public static function clear(): void
    {
        self::$_hooks = [
            'actions' => [],
            'filters' => [],
        ];
    }

    public static function getAll(): array
    {
        return self::$_hooks;
    }


}
