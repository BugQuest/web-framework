<?php

namespace BugQuest\Framework\Models;

use BugQuest\Framework\Services\Assets;
use BugQuest\Framework\Services\OptionService;
use BugQuest\Framework\Services\View;

class Map
{
    public function __construct(
        public string     $view = 'default',
        public ?MapCenter $center = null,
        public ?string    $layer = null,
        public ?string    $attribution = null,
        public ?array     $options = null,
        /**
         * @var MapMarker[]
         */
        private array     $_markers = [],
        private array     $_data = []
    )
    {
        if (!$this->view)
            $this->view = 'default';

        if (!$this->center) {
            $defaultCenter = OptionService::get('Map', 'default_center', [
                'x' => 0.0,
                'y' => 0.0,
            ]);
            $this->center = new MapCenter(
                lng: $defaultCenter['x'],
                lat: $defaultCenter['y'],
                zoom: OptionService::get('Map', 'default_zoom', 20)
            );
        }

        if ($this->options == null)
            $this->options = [
                'scrollWheelZoom' => false,
                'zoomControl' => true,
                'mapTypeControl' => false,
                'scaleControl' => false,
                'streetViewControl' => false,
                'rotateControl' => false,
                'keyboardShortcuts' => false,
                'draggable' => true
            ];

        if (!$this->layer)
            $this->layer = OptionService::get('Map', 'default_layer', 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

        if (!$this->attribution)
            $this->attribution = OptionService::get('Map', 'default_attribution', 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors');
    }

    public function addMarker(MapMarker $marker)
    {
        $this->_markers[] = $marker;

        return $this;
    }

    public function addData(string $key, mixed $value): self
    {
        $this->_data[$key] = $value;

        return $this;
    }

    public function render(): string
    {
        Assets::add(
            group: 'map',
            id: 'js:map',
            url: '/framework/assets/js/map',
            type: 'js',
            isLocalUrl: true,
        );
        
        $view_path = 'map/' . $this->view . '.twig';

        if (!View::hasTemplate($view_path))
            throw new \Exception("View not found: $view_path");

        return View::render($view_path, [
            'data' => $this->data,
            'options' => json_encode([
                'markers' => array_map(fn($marker) => $marker->toArray(), $this->_markers),
                'center' => $this->center->toArray(),
                'layer' => $this->layer,
                'attribution' => $this->attribution,
                'options' => $this->options,
            ]),
        ]);
    }
}