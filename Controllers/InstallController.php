<?php

namespace BugQuest\Framework\Controllers;

use BugQuest\Framework\Models\Database\User;
use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Services\Database;
use BugQuest\Framework\Services\MetaService;
use BugQuest\Framework\Services\MigrationManager;
use BugQuest\Framework\Router;

class InstallController
{
    public static function index(): Response
    {
        if (Database::isInstalled())
            Router::redirect('admin.dashboard');

        $error = '';
        $username = '';
        $password = '';
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
            $email = trim($email);

            $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_SPECIAL_CHARS);
            $username = trim($username);

            $password = filter_input(INPUT_POST, 'password');
            $password = trim($password);

            $passwordConfirm = filter_input(INPUT_POST, 'confirm_password');
            $passwordConfirm = trim($passwordConfirm);

            if (empty($username) || empty($password) || empty($passwordConfirm) || empty($email))
                $error = __('Tous les champs sont obligatoires.', 'install', 'fr');

//            if (strlen($username) < 3 || strlen($username) > 20)
//                $error = 'Le nom d\'utilisateur doit contenir entre 3 et 20 caractères.';
//
//            if (strlen($password) < 6 || strlen($password) > 20)
//                $error = 'Le mot de passe doit contenir entre 6 et 20 caractères.';

            if ($password !== $passwordConfirm)
                $error = __('Les mots de passe ne correspondent pas.', 'install', 'fr');

            if (!preg_match('/^[a-zA-Z0-9_]+$/', $username))
                $error = __("Le nom d'utilisateur ne doit contenir que des lettres, des chiffres et des underscores.", 'install', 'fr');

//            //password with at least one uppercase letter, one lowercase letter, one number and one special character
//            if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/', $password))
//                $error = 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial.';

            if (!$error) {
                MigrationManager::migrateAll();

                // Hash + insertion dans la table users
                $user = new User();
                $user->username = $username;
                $user->password = password_hash($password, PASSWORD_DEFAULT);
                $user->email = $email;
                $user->role = 'admin';
                $user->save();


                MetaService::update('installed', true);
                MetaService::update('locale', get_locale());

                Router::redirect('auth.login');
            }
        }

        return Response::view('@framework/install/index.twig',
            [
                'error' => $error,
                'email' => $email ?? '',
                'username' => $username,
                'password' => $password
            ]);
    }
}
