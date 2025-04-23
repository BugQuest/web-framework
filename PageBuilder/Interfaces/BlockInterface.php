<?php

namespace BugQuest\Framework\PageBuilder\Interfaces;

interface BlockInterface
{
    public function getName(): string;

    public function getLabel(): string;

    public function getCategory(): string;

    public function renderCallback(array $data = []): string;

    public function getDefaultContent(): array;
}