<?php

namespace BugQuest\Framework\Middleware;

use BugQuest\Framework\Models\Database\User;
use BugQuest\Framework\Router;
use BugQuest\Framework\Services\Auth;

class AdminAuthMiddleware
{
    public function handle(callable $next)
    {
        session_start();

        if (!isset($_SESSION['user_id']))
            Router::redirect('auth.login');

        $user = User::find($_SESSION['user_id']);

        if (!$user || !$user->isAdmin()) {
            http_response_code(403);
            exit('🚫 Accès interdit – Vous devez être administrateur.');
        }

        // On injecte l'utilisateur dans une helper statique ou singleton si tu veux y accéder ailleurs
        Auth::setUser($user);

        return $next();
    }
}
