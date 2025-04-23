<?php

namespace BugQuest\Framework\PageBuilder\Blocks;

use BugQuest\Framework\PageBuilder\Interfaces\BlockInterface;
use BugQuest\Framework\Services\View;

class TextBlock implements BlockInterface
{
    public array $data = [];

    public function getName(): string
    {
        return 'text';
    }

    public function getLabel(): string
    {
        return 'Texte';
    }

    public function getCategory(): string
    {
        return 'custom';
    }

    public function getCustomData(): array
    {
        return [
            'text' => [
                'type' => 'wysiwyg',
                'label' => 'Texte',
                'default' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            ]
        ];
    }

    public function getData(): array
    {
        return [];
    }

    public function renderCallback(array $data = []): string
    {
        return View::render('@framework/blocks/text.twig', $data);
    }
}