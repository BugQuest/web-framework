<?php

namespace BugQuest\Framework\Middlewares;

use BugQuest\Framework\Models\Database\User;
use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Services\Auth;

class PlainAdminAuthMiddleware
{
    public function handle(callable $next)
    {
        if (!session_id())
            session_start();

        if (!isset($_SESSION['user_id']))
            return Response::unauthorized();

        $user = User::find($_SESSION['user_id']);

        if (!$user || !$user->isAdmin())
            return Response::unauthorized();

        // On injecte l'utilisateur dans une helper statique ou singleton si tu veux y accéder ailleurs
        Auth::setUser($user);

        return $next();
    }
}
