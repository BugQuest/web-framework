<?php

namespace BugQuest\Framework\Models;

class MapCenter
{
    public function __construct(
        public float $lat,
        public float $lng,
        public int   $zoom = 10,
    )
    {
    }

    public function toArray(): array
    {
        return [
            'lat' => $this->lat,
            'lng' => $this->lng,
            'zoom' => $this->zoom,
        ];
    }
}