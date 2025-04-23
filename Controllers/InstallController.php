<?php

namespace BugQuest\Framework\Controllers;

use BugQuest\Framework\Models\Database\Meta;
use BugQuest\Framework\Models\Database\User;
use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Models\Route;
use BugQuest\Framework\Services\Database;
use BugQuest\Framework\Services\MetaService;
use BugQuest\Framework\Services\View;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Capsule\Manager;
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
                // Création des tables
                Manager::schema()->create('users', function (Blueprint $table) {
                    $table->id();
                    $table->string('username')->unique();
                    $table->string('email')->unique();
                    $table->string('password');
                    $table->string('role');
                    $table->timestamps();
                });

                Manager::schema()->create('meta', function (Blueprint $table) {
                    $table->string('key')->primary();
                    $table->text('value')->nullable();
                    $table->string('type', 16);
                    $table->timestamps();
                });

                Manager::schema()->create('i18n_missing', function (Blueprint $table) {
                    $table->id();
                    $table->string('domain', 64);
                    $table->string('locale', 8);
                    $table->string('keyname', 255);
                    $table->timestamps();

                    $table->unique(['domain', 'locale', 'keyname'], 'i18n_missing_unique');
                });

                Manager::schema()->create('medias', function (Blueprint $table) {
                    $table->id();

                    $table->string('filename'); // Nom final stocké sur le disque
                    $table->string('original_name'); // Nom original (upload)
                    $table->string('mime_type');
                    $table->string('extension', 10)->nullable();
                    $table->bigInteger('size')->nullable(); // En octets
                    $table->string('path')->nullable(); // Chemin absolu ou relatif
                    $table->string('url')->nullable(); // URL d'accès public
                    $table->string('slug')->nullable(); // Pour une gestion plus lisible côté admin
                    $table->json('exif')->nullable(); // Données EXIF (photo, orientation...)
                    $table->json('meta')->nullable(); // Données supplémentaires (auteur, description…)

                    $table->timestamps();
                });

                Manager::schema()->create('media_tags', function (Blueprint $table) {
                    $table->id();
                    $table->string('name');
                    $table->string('slug')->unique();
                    $table->timestamps();
                });

                Manager::schema()->create('media_tag_media', function (Blueprint $table) {
                    $table->unsignedBigInteger('media_id');
                    $table->unsignedBigInteger('tag_id');

                    $table->foreign('media_id')->references('id')->on('medias')->onDelete('cascade');
                    $table->foreign('tag_id')->references('id')->on('media_tags')->onDelete('cascade');

                    $table->primary(['media_id', 'tag_id']);
                });;

                Manager::schema()->create('options', function (Blueprint $table) {
                    $table->id();
                    $table->string('group', 64);
                    $table->string('key', 128);
                    $table->text('value')->nullable();
                    $table->string('type', 16);
                    $table->timestamps();

                    $table->unique(['group', 'key']);
                });

                //page
                Manager::schema()->create('pages', function (Blueprint $table) {
                    $table->id();
                    $table->unsignedBigInteger('parent_id')->nullable();
                    $table->string('title');
                    $table->string('slug')->unique();
                    $table->text('html')->nullable();
                    $table->text('css')->nullable();
                    $table->json('builder_data')->nullable();
                    $table->enum('status', ['draft', 'private', 'published', 'archived'])->default('draft');
                    $table->integer('order')->default(0);
                    $table->timestamps();

                    $table->foreign('parent_id')->references('id')->on('pages')->onDelete('set null');
                });

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
