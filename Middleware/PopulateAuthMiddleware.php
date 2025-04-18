<?php

namespace BugQuest\Framework\Middleware;

use BugQuest\Framework\Models\Database\User;
use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Router;
use BugQuest\Framework\Services\Auth;

class PopulateAuthMiddleware
{
    public function handle(callable $next)
    {
        if (!session_id())
            session_start();

        if ($sessionUserId = $_SESSION['user_id'] ?? null)
            if ($user = User::find($sessionUserId))
                Auth::setUser($user);

        return $next();
    }
}
