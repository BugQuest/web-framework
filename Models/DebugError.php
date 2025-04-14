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
            $parsed[] = [
                'index' => $i,
                'file' => $entry['file'] ?? '[internal]',
                'line' => $entry['line'] ?? '',
                'function' => $entry['function'] ?? '',
                'class' => $entry['class'] ?? '',
                'type' => $entry['type'] ?? '',
                'args' => array_map(fn($a) => gettype($a), $entry['args'] ?? []),
            ];
        }

        return $parsed;
    }
}
