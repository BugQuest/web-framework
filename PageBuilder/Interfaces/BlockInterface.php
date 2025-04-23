<?php

namespace BugQuest\Framework\PageBuilder\Interfaces;

interface BlockInterface
{
    public array $data {
        get;
        set;
    }

    public function getName(): string;

    public function getLabel(): string;

    public function getCategory(): string;

    public function getCustomData(): array;

    public function renderCallback(array $data = []): string;
}