<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Models\User;

class Auth
{
    private static ?User $user = null;

    public function setUser(User $user): void
    {
        self::$user = $user;
    }

    public function user(): ?User
    {
        return self::$user;
    }

    public function check(): bool
    {
        return self::$user !== null;
    }

    public function isAdmin(): bool
    {
        return self::$user?->isAdmin() ?? false;
    }
}
