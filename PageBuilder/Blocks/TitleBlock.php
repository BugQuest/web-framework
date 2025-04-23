<?php

namespace BugQuest\Framework\PageBuilder\Blocks;

use BugQuest\Framework\PageBuilder\Interfaces\BlockInterface;
use BugQuest\Framework\Services\View;

class TitleBlock implements BlockInterface
{
    public array $data = [];

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

    public function getCustomData(): array
    {
        return [
            'text' => [
                'type' => 'string',
                'label' => 'Texte',
                'default' => 'Titre de la page',
            ],
            'level' => [
                'type' => 'select',
                'label' => 'Niveau',
                'options' => [
                    'h1' => 'H1',
                    'h2' => 'H2',
                    'h3' => 'H3',
                    'h4' => 'H4',
                    'h5' => 'H5',
                    'h6' => 'H6',
                ],
                'default' => 'h1',
            ],
        ];
    }

    public function getData(): array
    {
        return [];
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