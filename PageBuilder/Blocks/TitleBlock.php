<?php

namespace BugQuest\Framework\PageBuilder\Blocks;

use BugQuest\Framework\PageBuilder\Interfaces\BlockInterface;
use BugQuest\Framework\Services\View;

class TitleBlock implements BlockInterface
{
    public function getName(): string
    {
        return 'title';
    }

    public function getLabel(): string
    {
        return 'Titre';
    }

    public function getCategory(): string
    {
        return 'custom';
    }

    public function renderCallback(array $data = []): string
    {
        return View::render('@framework/blocks/title.twig', $data);
    }

    public function getDefaultContent(): array
    {
        return [
            'text' => 'Titre de la page',
            'level' => 'h1',
        ];
    }
}