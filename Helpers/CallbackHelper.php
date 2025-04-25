<?php

namespace BugQuest\Framework\Helpers;

abstract class CallbackHelper
{
    public static function parse(mixed $callback): array|callable|string
    {
        if ($error = self::_isValid($callback)) {
            throw new \Exception($error);
        }

        if (is_string($callback)) {
            $separators = [
                '->',     // méthode d’instance
                '@',      // notation type Laravel
                '->method',
                '->function',
                '->call',
                '->class',
                '::',     // méthode statique
                '::method',
                '::function',
                '::call',
                '::class',
            ];

            foreach ($separators as $separator) {
                if (str_contains($callback, $separator)) {
                    $parts = explode($separator, $callback);
                    if (count($parts) === 2) {
                        return str_starts_with($separator, '->') || $separator === '@'
                            ? [new $parts[0], $parts[1]]
                            : [$parts[0], $parts[1]];
                    }
                }
            }

            return $callback;
        }

        if (is_array($callback)) {
            return [new $callback[0], $callback[1]];
        }

        return $callback;
    }


    public static function documentation(mixed $callback): array
    {
        if (is_string($callback)) {
            $exploded = explode('@', $callback);
            if (count($exploded) === 2)
                return [
                    'type' => 'instance',
                    'default' => $callback,
                    'class' => $exploded[0],
                    'method' => $exploded[1]
                ];

            $exploded = explode('::', $callback);
            if (count($exploded) === 2) return [
                'type' => 'static',
                'default' => $callback,
                'class' => $exploded[0],
                'method' => $exploded[1]
            ];
        }

        if (is_array($callback))
            return [
                'type' => 'instance',
                'default' => null,
                'class' => $callback[0],
                'method' => $callback[1]
            ];

        return [
            'type' => 'callable',
            'default' => null,
            'class' => null,
            'method' => null
        ];
    }

    private static function _isValid($callback): string
    {
        if (is_string($callback)) {
            foreach (['@', '::', '->', '::class', '->class', '->method', '::method', '->function', '::function', '->call', '::call'] as $delimiter) {
                $exploded = explode($delimiter, $callback);
                if (count($exploded) === 2) {
                    [$class, $method] = $exploded;
                    if (!class_exists($class)) return "Class $class does not exist";
                    if (!method_exists($class, $method)) return "Method $method does not exist in class $class";
                    return '';
                }
            }
        } elseif (is_array($callback)) {
            [$class, $method] = $callback;
            if (!class_exists($class)) return "Class $class does not exist";
            if (!method_exists($class, $method)) return "Method $method does not exist in class $class";
        } elseif (!is_callable($callback))
            return 'Callback is not callable';

        return '';
    }
}