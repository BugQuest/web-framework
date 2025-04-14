<?php

namespace BugQuest\Framework\Models;

use BugQuest\Framework\Helpers\CallbackHelper;
use BugQuest\Framework\Router;
use BugQuest\Framework\Services\Hooks;

class Route
{
    private static ?self $_current = null;

    private static array $customPatterns = [];

    public function __construct(
        public string               $name,
        private readonly string     $_slug = '*',
        private                     $_callback = null,
        private readonly array      $_methods = ['GET'],
        private array               $_middlewares = [],
        public readonly ?RouteGroup $group = null
    )
    {
    }


    public static function current(): ?self
    {
        return self::$_current;
    }

    public function getSlug(): string
    {
        return $this->_slug;
    }

    public function getMethods(): array
    {
        return $this->_methods;
    }

    public function getMiddlewares(): array
    {
        return $this->_middlewares;
    }

    public function register(): self
    {
        Router::add($this);

        return $this;
    }

    public function acceptsMethod(string $method): bool
    {
        return in_array(strtoupper($method), $this->_methods, true);
    }

    /**
     * Vérifie si le callback est valide.
     */
    public function callbackIsValid(): string
    {
        $cb = $this->_callback;

        if (is_string($cb)) {
            foreach (['@', '::'] as $delimiter) {
                $exploded = explode($delimiter, $cb);
                if (count($exploded) === 2) {
                    [$class, $method] = $exploded;
                    if (!class_exists($class)) return "Class $class does not exist";
                    if (!method_exists($class, $method)) return "Method $method does not exist in class $class";
                    return '';
                }
            }
        } elseif (is_array($cb)) {
            [$class, $method] = $cb;
            if (!class_exists($class)) return "Class $class does not exist";
            if (!method_exists($class, $method)) return "Method $method does not exist in class $class";
        } elseif (!is_callable($cb)) {
            return 'Callback is not callable';
        }

        return '';
    }

    /**
     * Retourne le callback sous forme de callable exécutable.
     */
    public function getCallable(): mixed
    {
        return $this->_callback;
    }

    /**
     * Exécute le callback avec les bons paramètres (paramètres + valeurs par défaut).
     */
    public function process(array $params = []): mixed
    {
        $callback = CallbackHelper::parse($this->_callback);
        $defaults = $this->getCallbackParameterDefaults();

        $args = [];
        for ($i = 0; $i < count($defaults); $i++) {
            $args[] = $params[$i] ?? $defaults[$i] ?? null;
        }

        self::$_current = $this;
        Hooks::runAction('route.before', $this, $args);
        return call_user_func_array($callback, $args);
    }

    /**
     * Vérifie si l'URI correspond à cette route.
     */
    public function matches(string $uri): bool
    {
        return (bool)preg_match($this->getRegexPattern(), $uri);
    }

    /**
     * Extrait les paramètres dynamiques de l'URI.
     */
    public function matchUri(string $uri): ?array
    {
        if (!preg_match($this->getRegexPattern(), $uri, $values)) {
            return null;
        }

        array_shift($values); // retirer le full match

        $types = $this->getParameterTypes();
        $final = [];

        foreach ($types as $i => $type) {
            $val = $values[$i] ?? null;

            $final[] = match ($type) {
                'int' => $val !== null ? (int)$val : null,
                default => $val,
            };
        }

        return $final;
    }

    /**
     * Retourne les paramètres complets à injecter dans le callback.
     */
    public function getResolvedParameters(array $params): array
    {
        $defaults = $this->getCallbackParameterDefaults();
        $final = [];

        for ($i = 0; $i < count($defaults); $i++) {
            $final[] = $params[$i] ?? $defaults[$i] ?? null;
        }

        return $final;
    }

    /**
     * Retourne les noms des paramètres dans l’ordre.
     */
    public function getParameterNames(): array
    {
        $paramRegex = '#\{(\w+)(?::\w+)?\??\}#';
        preg_match_all($paramRegex, $this->_slug, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Retourne les types des paramètres dans l’ordre.
     */
    private function getParameterTypes(): array
    {
        $paramRegex = '#\{(\w+)(?::(\w+))?(\?)?\}#';
        preg_match_all($paramRegex, $this->_slug, $matches, PREG_SET_ORDER);

        $types = [];
        foreach ($matches as $match) {
            $types[] = $match[2] ?? 'string';
        }

        return $types;
    }

    /**
     * Retourne les valeurs par défaut des paramètres du callback.
     */
    private function getCallbackParameterDefaults(): array
    {
        $callable = CallbackHelper::parse($this->_callback);

        $ref = is_array($callable)
            ? new \ReflectionMethod($callable[0], $callable[1])
            : new \ReflectionFunction($callable);

        $defaults = [];
        foreach ($ref->getParameters() as $param) {
            $defaults[] = $param->isDefaultValueAvailable()
                ? $param->getDefaultValue()
                : null;
        }

        return $defaults;
    }

    /**
     * Retourne le pattern regex compilé à partir du slug.
     */
    public function getRegexPattern(): string
    {
        $paramRegex = '#\{(\w+)(?::(\w+))?(\?)?\}#';

        // On évite les segments vides dus à un slash en début ou fin
        $segments = array_filter(explode('/', $this->_slug), fn($s) => $s !== '');
        $patternParts = [];
        $first = true;

        foreach ($segments as $segment) {
            $prefix = $first ? '/' : '/';
            $first = false;

            if (preg_match($paramRegex, $segment, $m)) {
                $type = strtolower($m[2] ?? 'string');
                $optional = isset($m[3]);

                $regex = self::_getPatternForType($type);
                $part = '(' . $regex . ')';

                $patternParts[] = $optional
                    ? '(?:' . $prefix . $part . ')?'
                    : $prefix . $part;
            } else {
                $patternParts[] = $prefix . preg_quote($segment, '#');
            }
        }

        return '#^' . implode('', $patternParts) . '/?$#';
    }

    public function getDocumentation(): array
    {
        $paramRegex = '#\{(\w+)(?::(\w+))?(\?)?\}#';
        preg_match_all($paramRegex, $this->_slug, $matches, PREG_SET_ORDER);

        $parameters = [];
        foreach ($matches as $match) {
            $parameters[] = [
                'name' => $match[1],
                'type' => $match[2] ?? 'string',
                'optional' => isset($match[3]),
            ];
        }

        return [
            'name' => $this->name,
            'slug' => $this->_slug,
            'parameters' => $parameters,
            'regex' => $this->getRegexPattern(),
            'callback' => CallbackHelper::documentation($this->_callback),
            'methods' => $this->_methods,
        ];
    }

    public function isFallback(): bool
    {
        return $this->_slug === '*';
    }

    public function withMiddleware(string|array $middleware): static
    {
        $this->_middlewares = array_merge(
            $this->_middlewares,
            is_array($middleware) ? $middleware : [$middleware]
        );
        return $this;
    }



    //===============================================*
    // * Static methods for custom patterns
    //===============================================*

    private static function _getPatternForType(string $type): string
    {
        $type = strtolower($type);
        return self::_getAllPatterns()[$type] ?? '[^/]+';
    }

    public static function getAvailableTypes(): array
    {
        return array_keys(self::_getAllPatterns());
    }

    private static function _getAllPatterns(): array
    {
        return array_merge([
            'int' => '\d+',
            'float' => '\d+(\.\d+)?',
            'bool' => '(true|false)',
            'date' => '\d{4}-\d{2}-\d{2}',
            'datetime' => '\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}',
            'email' => '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
            'phone' => '\+?\d{1,3}[-.\s]?\(?\d+\)?[-.\s]?\d+[-.\s]?\d+',
            'url' => '(https?:\/\/[^\s]+)',
            'ip' => '(?:\d{1,3}\.){3}\d{1,3}',
            'ipv6' => '([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}',
            'uuid' => '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}',
            'alpha' => '[a-zA-Z]+',
            'alphanumeric' => '[a-zA-Z0-9]+',
            'numeric' => '[0-9]+',
            'hex' => '[0-9a-fA-F]+',
            'binary' => '[01]+',
            'octal' => '[0-7]+',
            'base64' => '[A-Za-z0-9+/=]+',
            'json' => '\{(?:[^{}]|(?R))*\}',
        ], self::$customPatterns);
    }

    public static function registerType(string $type, string $pattern): void
    {
        self::$customPatterns[$type] = $pattern;
    }
}
