<?php

namespace BugQuest\Framework\Controllers;

use BugQuest\Framework\Models\Database\User;
use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Router;
use BugQuest\Framework\Services\View;

class AuthController
{
    public static function login(): Response
    {
        $error = "";
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_SPECIAL_CHARS);
            $password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_SPECIAL_CHARS);

            $user = User::where('email', $email)->first();

            if (!$user)
                $user = User::where('username', $email)->first();

            if ($user && password_verify($password, $user->password)) {
                session_start();
                $_SESSION['user_id'] = $user->id;
                Router::redirect('admin.dashboard');
            }

            $error = __('Identifiants invalides.', 'auth', 'fr');

        }

        return Response::view('@framework/auth/login.twig', [
            'error' => $error,
        ]);
    }

    public static function logout(): void
    {
        session_start();
        unset($_SESSION['user_id']);
        Router::redirect('auth.login');
    }
}
