<?php

namespace BugQuest\Framework\Models;

class MapCenter
{
    public function __construct(
        public float $lng,
        public float $lat,
        public int   $zoom = 10,
    )
    {
    }

    public function toArray(): array
    {
        return [
            'lng' => $this->lng,
            'lat' => $this->lat,
            'zoom' => $this->zoom,
        ];
    }
}