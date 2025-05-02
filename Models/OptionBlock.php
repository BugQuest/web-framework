<?php

namespace BugQuest\Framework\Models;

use BugQuest\Framework\Helpers\CallbackHelper;

class OptionBlock
{
    public function __construct(
        public string $type,
        public string $key,
        public string $label,
        public mixed  $defaultValue = null,
        public mixed  $options = [],
        /** Group for wrapper */
        public string $group = 'default',
    )
    {
        if (!in_array($this->type, [
            'int',
            'float',
            'string',
            'media',
            'select',
            'bool',
            'textarea',
            'wysiwyg',
            'url',
            'page']))
            throw new \Exception("Invalid option block type '{$this->type}'.");
    }

    public function getOptions(): array
    {
        if (is_array($this->options) && !is_callable($this->options))
            return $this->options;

        return CallbackHelper::parse($this->options)() ?? [];
    }

    public function toArray(): array
    {
        return [
            'type' => $this->type,
            'key' => $this->key,
            'label' => $this->label,
            'defaultValue' => $this->defaultValue,
            'options' => $this->getOptions(),
            'group' => $this->group,
        ];
    }

    public function toJson(): string
    {
        return json_encode($this);
    }
}