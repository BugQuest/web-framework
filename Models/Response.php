<?php

namespace BugQuest\Framework\Models;

use BugQuest\Framework\Debug;
use BugQuest\Framework\Services\Hooks;
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
        array  $headers = [],
    ): static
    {
        $content = ['success' => true,];
        if ($message)
            $content['message'] = $message;

        return new static(
            content: $content,
            status: 200,
            headers: array_merge($headers, ['Content-Type' => 'application/json']),
        );
    }

    public static function jsonError(
        string $message = '',
        array  $headers = [],
    ): static
    {
        $content = ['success' => false,];
        if ($message)
            $content['message'] = $message;

        return new static(
            content: $content,
            status: 400,
            headers: array_merge($headers, ['Content-Type' => 'application/json']),
        );
    }

    public static function jsonServerError(
        string $message = 'Internal server error',
        array  $headers = [],
    ): static
    {
        return new static(
            content: ['success' => false, 'message' => $message],
            status: 500,
            headers: array_merge($headers, ['Content-Type' => 'application/json']),
        );
    }

    public static function json404(
        string $message = 'Page not found',
        array  $headers = [],
    ): static
    {
        return new static(
            content: ['success' => false, 'message' => $message],
            status: 404,
            headers: array_merge($headers, ['Content-Type' => 'application/json']),
        );
    }

    public static function json401(
        string $message = 'Unauthorized',
        array  $headers = [],
    ): static
    {
        return new static(
            content: ['success' => false, 'message' => $message],
            status: 401,
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
        array  $headers = [],
    ): static
    {
        return new static(
            content: View::render('@framework/error/404.twig', ['message' => $message]),
            status: 404,
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
            status: 302,
            headers: array_merge($headers, [
                'Location' => $url,
                'Content-Type' => 'text/html',
            ]),
        );
    }

    public static function frameworkJS(
        string $name,
        array  $headers = [],
    ): static
    {
        $path = BQ_FRAMEWORK_PATH . DS . 'dist' . DS . 'js/' . $name . '.js';
        if (file_exists($path)) {
            return new static(
                content: file_get_contents($path),
                status: 200,
                headers: array_merge($headers, ['Content-Type' => 'application/javascript']),
            );
        } else {
            return new static(
                content: '',
                status: 404,
                headers: array_merge($headers, ['Content-Type' => 'text/html']),
            );
        }
    }

    public static function frameworkJSMap(
        string $name,
        array  $headers = [],
    ): static
    {
        $path = BQ_FRAMEWORK_PATH . DS . 'dist' . DS . 'js/' . $name . '.js.map';
        if (file_exists($path)) {
            return new static(
                content: file_get_contents($path),
                status: 200,
                headers: array_merge($headers, ['Content-Type' => 'application/json']),
            );
        } else {
            return new static(
                content: '',
                status: 404,
                headers: array_merge($headers, ['Content-Type' => 'text/html']),
            );
        }
    }

    public static function frameworkCSS(
        string $name,
        array  $headers = [],
    ): static
    {
        $path = BQ_FRAMEWORK_PATH . DS . 'dist' . DS . 'css/' . $name . '.css';
        if (file_exists($path)) {
            return new static(
                content: file_get_contents($path),
                status: 200,
                headers: array_merge($headers, ['Content-Type' => 'text/css']),
            );
        } else {
            return new static(
                content: '',
                status: 404,
                headers: array_merge($headers, ['Content-Type' => 'text/html']),
            );
        }
    }

    public static function frameworkCSSMap(
        string $name,
        array  $headers = [],
    ): static
    {
        $path = BQ_FRAMEWORK_PATH . DS . 'dist' . DS . 'css/' . $name . '.css.map';
        if (file_exists($path)) {
            return new static(
                content: file_get_contents($path),
                status: 200,
                headers: array_merge($headers, ['Content-Type' => 'application/json']),
            );
        } else {
            return new static(
                content: '',
                status: 404,
                headers: array_merge($headers, ['Content-Type' => 'text/html']),
            );
        }
    }

    public static function unauthorized(
        string $message = 'Unauthorized',
        array  $headers = [],
    ): static
    {
        return new static(
            content: $message,
            status: 401,
            headers: array_merge($headers, ['Content-Type' => 'text/plain']),
        );
    }

    public function send(): void
    {
        http_response_code($this->status);

        foreach ($this->headers as $key => $value)
            header("$key: $value");

        if (is_array($this->content) || is_object($this->content)) {
            echo json_encode($this->content);
        } else {
            echo $this->content;
        }
    }

    public static function __set_state(array $array): static
    {
        return new static(
            content: $array['content'],
            status: $array['status'],
            headers: $array['headers'],
        );
    }
}