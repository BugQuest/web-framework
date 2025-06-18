<?php

namespace BugQuest\Framework\PageBuilder\Blocks;

use BugQuest\Framework\PageBuilder\Interfaces\BlockInterface;
use BugQuest\Framework\Services\Assets;
use BugQuest\Framework\Services\OptionService;
use BugQuest\Framework\Services\View;
use BugQuest\Framework\Models\Map;

class MapBlock implements BlockInterface
{
    public array $data = [];

    public function getName(): string
    {
        return 'map';
    }

    public function getLabel(): string
    {
        return 'Map';
    }

    public function getCategory(): string
    {
        return 'custom';
    }

    public function getCustomData(): array
    {
        return [
            'layer' => [
                'type' => 'string',
                'label' => 'URL du layer',
                'default' => OptionService::get('Map', 'default_layer', 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
            ],
            'attribution' => [
                'type' => 'string',
                'label' => 'Attribution',
                'default' => OptionService::get('Map', 'default_attribution', 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'),
            ],
        ];
    }

    public function getData(): array
    {
        return [];
    }

    public function renderCallback(array $data = []): string
    {
        Assets::add(
            group: 'global',
            id: 'js:map',
            url: '/framework/assets/js/map-block',
            type: 'js',
            isLocalUrl: true,
        );

        $map = new Map('default');
        return $map->render();
    }
}