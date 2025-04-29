<?php

namespace BugQuest\Framework\Services;

class Payload
{
    protected array $data;

    /**
     * @throws \Exception
     */
    public static function fromRawInput(): self
    {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw, true);

        if (!is_array($decoded)) {
            throw new \Exception("Le corps de la requête n'est pas un JSON valide.");
        }

        return new self($decoded);
    }

    public static function fromArray(array $array): self
    {
        return new self($array);
    }

    private function __construct(array $data)
    {
        $this->data = $data;
    }

    public function getRaw(): array
    {
        return $this->data;
    }

    /**
     * @throws \Exception
     */
    public function expectArrayOf(array $schema): array
    {
        if (!is_array($this->data)) {
            throw new \Exception("Payload attendu comme tableau de valeurs.");
        }

        $result = [];

        foreach ($this->data as $index => $item) {
            if (!is_array($item)) {
                throw new \Exception("L'élément à l'index $index n'est pas un objet.");
            }

            $result[] = $this->validateItem($item, $schema, $index);
        }

        return $result;
    }

    public function expectObject(array $schema): array
    {
        return $this->validateItem($this->data, $schema);
    }

    /**
     * @throws \Exception
     */
    protected function validateItem(array $item, array $schema, int $index = -1): array
    {
        $validated = [];

        foreach ($schema as $key => $typeInfo) {
            $label = $index >= 0 ? " à l'index $index" : '';

            $typeStr = null;
            $defaultValue = null;

            if (is_array($typeInfo)) {
                [$typeStr, $defaultValue] = $typeInfo;
            } else {
                $typeStr = $typeInfo;
            }

            $expectedTypes = explode('|', $typeStr);

            $hasKey = array_key_exists($key, $item);
            $value = $hasKey ? $item[$key] : $defaultValue;

            if (!$hasKey && $defaultValue === null) {
                throw new \Exception("Clé '$key' manquante$label et aucune valeur par défaut.");
            }

            if (!$this->validateMultipleTypes($value, $expectedTypes)) {
                $actual = gettype($value);
                throw new \Exception("Clé '$key'$label invalide : attendu $typeStr, reçu $actual.");
            }

            // Slugify uniquement si type autorisé et chaîne valide
            if (in_array('slug', $expectedTypes, true) && is_string($value)) {
                $value = $this->slugify($value);
            }

            $validated[$key] = $value;
        }

        return $validated;
    }

    protected function validateMultipleTypes(mixed $value, array $types): bool
    {
        return array_any($types, fn($type) => $this->validateType($value, $type));
    }

    protected function validateType(mixed $value, string $type): bool
    {
        return match ($type) {
            'int' => is_int($value),
            'string', 'slug' => is_string($value),
            'array' => is_array($value),
            'bool' => is_bool($value),
            'null' => is_null($value),
            default => false,
        };
    }

    protected function slugify(string $text): string
    {
        $text = strtolower(trim($text));
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        return $text;
    }
}
