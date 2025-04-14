<?php

namespace BugQuest\Framework\Interfaces;

interface MiddlewareInterface
{
    public function handle(callable $next): mixed;
}