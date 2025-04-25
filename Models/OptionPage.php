<?php

namespace BugQuest\Framework\Models;

use BugQuest\Framework\Helpers\CallbackHelper;

class OptionPage
{
    public function __construct(
        public string  $title,
        /** Group for save in options */
        public string  $group,
        private array  $_blocks = [],
        public string  $menuParent = 'config',
        public ?string $menuIcon = null,
        public ?string $menuTitle = null,
        public string  $submenu = 'options',
        /** @var $_header string|array|callable|null */
        private mixed  $_header = null,
    )
    {
        if ($_header == null)
            $this->_header = fn() => null;
    }

    public function registerBlock(OptionBlock $block): void
    {
        $this->_blocks[] = $block;
    }

    public function toArray(): array
    {
        $blocks = [];
        foreach ($this->_blocks as $block)
            $blocks[] = $block->toArray();

        return [
            'group' => $this->group,
            'blocks' => $blocks,
        ];
    }

    public function getHeader(): null|string
    {
        if (is_null($this->_header))
            return null;

        return CallbackHelper::parse($this->_header)() ?? null;
    }

    public function toJson(): string
    {
        return json_encode($this->toArray());
    }
}