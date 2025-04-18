<?php

namespace BugQuest\Framework\Models;

use BugQuest\Framework\Services\View;

readonly class Response
{
    public function __construct(
        public string|array|object $content,
        public int                 $status = 200,
        public array               $headers = [],
    )
    {

    }

    public static function json(
        array|object $content,
        int          $status = 200,
        array        $headers = [],
    ): static
    {
        return new static(
            content: $content,
            status: $status,
            headers: array_merge($headers, ['Content-Type' => 'application/json']),
        );
    }

    public static function jsonSuccess(
        string $message = '',
        int    $status = 200,
        array  $headers = [],
    ): static
    {
        $content = ['success' => true,];
        if ($message)
            $content['message'] = $message;

        return new static(
            content: $content,
            status: $status,
            headers: array_merge($headers, ['Content-Type' => 'application/json']),
        );
    }

    public static function jsonError(
        string $message = '',
        int    $status = 400,
        array  $headers = [],
    ): static
    {
        $content = ['success' => false,];
        if ($message)
            $content['message'] = $message;

        return new static(
            content: $content,
            status: $status,
            headers: array_merge($headers, ['Content-Type' => 'application/json']),
        );
    }

    public static function jsonServerError(
        string $message = 'Internal server error',
        int    $status = 500,
        array  $headers = [],
    ): static
    {
        return new static(
            content: ['success' => false, 'message' => $message],
            status: $status,
            headers: array_merge($headers, ['Content-Type' => 'application/json']),
        );
    }

    public static function json404(
        string $message = 'Page not found',
        int    $status = 404,
        array  $headers = [],
    ): static
    {
        return new static(
            content: ['success' => false, 'message' => $message],
            status: $status,
            headers: array_merge($headers, ['Content-Type' => 'application/json']),
        );
    }

    public static function html(
        string $content,
        int    $status = 200,
        array  $headers = [],
    ): static
    {
        return new static(
            content: $content,
            status: $status,
            headers: array_merge($headers, ['Content-Type' => 'text/html']),
        );
    }

    public static function view(
        string $view,
        array  $data = [],
        int    $status = 200,
        array  $headers = [],
    ): static
    {
        return new static(
            content: View::render($view, $data),
            status: $status,
            headers: array_merge($headers, ['Content-Type' => 'text/html']),
        );
    }

    public static function error404(
        string $message = 'Page not found',
        int    $status = 404,
        array  $headers = [],
    ): static
    {
        return new static(
            content: View::render('@framework/error/404.twig', ['message' => $message]),
            status: $status,
            headers: array_merge($headers, ['Content-Type' => 'text/html']),
        );
    }

    public static function redirect(
        string $url,
        int    $status = 302,
        array  $headers = [],
    ): static
    {
        return new static(
            content: null,
            status: $status,
            headers: array_merge($headers, [
                'Location' => $url,
                'Content-Type' => 'text/html',
            ]),
        );
    }

    public function send(): void
    {
        http_response_code($this->status);

        foreach ($this->headers as $key => $value) {
            header("$key: $value");
        }

        if (is_array($this->content) || is_object($this->content)) {
            echo json_encode($this->content);
        } else {
            echo $this->content;
        }
    }
}