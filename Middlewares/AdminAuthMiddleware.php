<?php

namespace BugQuest\Framework\Middlewares;

use BugQuest\Framework\Models\Database\User;
use BugQuest\Framework\Router;
use BugQuest\Framework\Services\Auth;

class AdminAuthMiddleware
{
    public function handle(callable $next)
    {
        if (!session_id())
            session_start();

        if (!isset($_SESSION['user_id']))
            Router::redirect('auth.login');

        $user = User::find($_SESSION['user_id']);

        if (!$user || !$user->isAdmin())
            Router::redirect('auth.logout');

        // On injecte l'utilisateur dans une helper statique ou singleton si tu veux y accéder ailleurs
        Auth::setUser($user);

        return $next();
    }
}
