<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Models\Database\User;

class Auth
{
    private static ?User $user = null;

    public static function setUser(User $user): void
    {
        self::$user = $user;
    }

    public static function user(): ?User
    {
        return self::$user;
    }

    public static function check(): bool
    {
        return self::$user !== null;
    }

    public static function isAdmin(): bool
    {
        return self::$user?->isAdmin() ?? false;
    }
}
