<?php

namespace BugQuest\Framework\Models;

use BugQuest\Framework\Services\Assets;
use BugQuest\Framework\Services\OptionService;
use BugQuest\Framework\Services\View;

class Map
{
    public function __construct(
        public string     $view = '@framework/map/default.twig',
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
        if (!$this->view || $this->view === 'default')
            $this->view = '@framework/map/default.twig';

        if (!$this->center) {
            $defaultCenter = OptionService::get('Map', 'default_center', [
                'x' => 0.0,
                'y' => 0.0,
            ]);
            $this->center = new MapCenter(
                lat: $defaultCenter['y'],
                lng: $defaultCenter['x'],
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
        if (!View::hasTemplate($this->view))
            throw new \Exception("View not found: $this->view");

        return View::render($this->view, [
            'data' => $this->_data,
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