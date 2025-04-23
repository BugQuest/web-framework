<?php

namespace BugQuest\Framework\PageBuilder;

use BugQuest\Framework\PageBuilder\Interfaces\BlockInterface;

abstract class BlockRegistry
{
    protected static array $_blocks = [];

    public static function register(string $class): void
    {
        $instance = new $class();
        self::$_blocks[$instance->getName()] = $instance;
    }

    public static function all(): array
    {
        return self::$_blocks;
    }

    public static function get(string $name): ?BlockInterface
    {
        return self::$_blocks[$name] ?? null;
    }

    public static function toJS(): string
    {
        return json_encode(array_map(fn(BlockInterface $block) => [
            'name' => $block->getName(),
            'label' => $block->getLabel(),
            'category' => $block->getCategory(),
            'content' => $block->getDefaultContent(),
        ], self::$_blocks));
    }
}