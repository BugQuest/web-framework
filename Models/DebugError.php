<?php

namespace BugQuest\Framework\Models;

class DebugError
{
    public string $message;
    public string $file;
    public int $line;
    public array $trace;

    public function __construct(\Throwable $exception)
    {
        $this->message = $exception->getMessage();
        $this->file = $exception->getFile();
        $this->line = $exception->getLine();
        $this->trace = $this->parseTrace($exception->getTrace());
    }

    private function parseTrace(array $trace): array
    {
        $parsed = [];

        foreach ($trace as $i => $entry) {
            $file = $entry['file'] ?? null;
            $line = $entry['line'] ?? null;

            $codeSnippet = null;
            if ($file && $line && is_readable($file)) {
                $codeSnippet = $this->getCodeSnippet($file, $line, 10);
            }

            $parsed[] = [
                'index' => $i,
                'file' => $file ?? '[internal]',
                'line' => $line ?? '',
                'function' => $entry['function'] ?? '',
                'class' => $entry['class'] ?? '',
                'type' => $entry['type'] ?? '',
                'args' => array_map([$this, 'formatArg'], $entry['args'] ?? []),
                'snippet' => $codeSnippet,
            ];
        }

        return $parsed;
    }

    private function getCodeSnippet(string $file, int $errorLine, int $padding = 10): array
    {
        $lines = @file($file, FILE_IGNORE_NEW_LINES);
        if ($lines === false) {
            return [];
        }

        $start = max(0, $errorLine - $padding - 1);
        $end = min(count($lines), $errorLine + $padding);

        $snippet = [];
        for ($i = $start; $i < $end; $i++) {
            $snippet[] = [
                'number' => $i + 1,
                'code' => $this->colorizePhp($lines[$i]), // <- coloration syntaxique ici
                'highlight' => ($i + 1 === $errorLine),
            ];
        }

        return $snippet;
    }


    private function formatArg($arg): string
    {
        return match (true) {
            is_object($arg) => 'Object(' . get_class($arg) . ')',
            is_array($arg) => 'Array(' . count($arg) . ')',
            is_string($arg) => '"' . $this->truncate($arg) . '"',
            is_int($arg), is_float($arg) => (string)$arg,
            is_bool($arg) => $arg ? 'true' : 'false',
            is_null($arg) => 'null',
            default => gettype($arg),
        };
    }

    private function truncate(string $str, int $maxLength = 30): string
    {
        return mb_strlen($str) > $maxLength
            ? mb_substr($str, 0, $maxLength) . '…'
            : $str;
    }

    private function colorizePhp(string $line): string
    {
        $tokens = token_get_all("<?php " . $line);
        array_shift($tokens); // remove the "<?php"

        $output = '';

        foreach ($tokens as $token) {
            if (is_string($token)) {
                $output .= htmlspecialchars($token);
                continue;
            }

            [$id, $text] = $token;

            $class = match ($id) {
                T_STRING, T_FUNCTION, T_CLASS, T_INTERFACE, T_TRAIT,
                T_USE, T_EXTENDS, T_IMPLEMENTS, T_NAMESPACE,
                T_IF, T_ELSE, T_ELSEIF, T_WHILE, T_FOR, T_FOREACH,
                T_THROW, T_TRY, T_CATCH, T_RETURN,
                T_PUBLIC, T_PROTECTED, T_PRIVATE, T_STATIC, T_ABSTRACT, T_FINAL,
                T_NEW, T_CLONE, T_VAR, T_CONST, T_INSTANCEOF, T_ECHO,
                T_EXIT, T_GLOBAL, T_ARRAY => 'php-keyword',

                T_VARIABLE => 'php-variable',
                T_CONSTANT_ENCAPSED_STRING => 'php-string',
                T_LNUMBER, T_DNUMBER => 'php-number',
                default => 'php-default',
            };

            $output .= '<span class="' . $class . '">' . htmlspecialchars($text) . '</span>';
        }

        return $output;
    }


}
