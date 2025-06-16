<?php

namespace BugQuest\Framework\Models;

use BugQuest\Framework\Services\OptionService;

class MapMarker
{
    public function __construct(
        public float   $lat,
        public float   $lng,
        public string  $index,
        public ?string $content = null,
        public ?array  $icon = null,
        public ?string $class = null,
    )
    {
        $default_size = OptionService::get(
            'Markers',
            'default_marker_size',
            [
                'x' => 40,
                'y' => 40,
            ]
        );

        $default_anchor = OptionService::get(
            'Markers',
            'default_marker_anchor',
            [
                'x' => 20,
                'y' => 20,
            ]
        );

        $default_popup_anchor = OptionService::get(
            'Markers',
            'default_popup_anchor',
            [
                'x' => 20,
                'y' => 40
            ]
        );

        if ($this->icon === null)
            $this->icon = [];

        if (!isset($this->icon['url']))
            $this->icon['url'] = 'div';

        if ($this->icon['url'] === 'div' && !isset($this->icon['content']))
            $this->icon['content'] = '<div class="marker-icon"></div>';

        if (!isset($this->icon['size']))
            $this->icon['size'] = [$default_size['x'], $default_size['y']];

        if (!isset($this->icon['anchor']))
            $this->icon['anchor'] = [$default_anchor['x'], $default_anchor['y']];

        if (!isset($this->icon['popup_anchor']))
            $this->icon['popup_anchor'] = [$default_popup_anchor['x'], $default_popup_anchor['y']];
    }

    public function toArray(): array
    {
        return [
            'lng' => $this->lng,
            'lat' => $this->lat,
            'index' => $this->index,
            'content' => $this->content,
            'icon' => $this->icon,
            'class' => $this->class,
        ];
    }
}