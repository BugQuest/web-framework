<?php

namespace BugQuest\Framework\Middleware;

class AdminAuthMiddleware
{
    public function handle(callable $next): mixed
    {
        // Exemple simple : vérifie si l'utilisateur est admin dans la session
        session_start();
        if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
            http_response_code(403);
            return "🚫 Accès interdit – Vous devez être administrateur.";
        }

        return $next();
    }
}
