<?php

namespace BugQuest\Framework\Controllers;

use BugQuest\Framework\Models\User;
use BugQuest\Framework\Router;

class AuthController
{
    public static function login(): string
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
            $password = filter_input(INPUT_POST, 'password', FILTER_SANITIZE_SPECIAL_CHARS);

            $user = User::where('email', $email)->first();

            if ($user && password_verify($password, $user->password)) {
                session_start();
                $_SESSION['user_id'] = $user->id;
                Router::redirect('admin.dashboard');
            }

            return 'Identifiants invalides';
        }

        return View::render('@framework/auth/login.twig');
    }

    public static function logout(): void
    {
        session_start();
        unset($_SESSION['user_id']);
        Router::redirect('auth.login');
    }
}
