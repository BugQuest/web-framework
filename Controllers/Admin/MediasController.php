<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Services\MediaManager;
use BugQuest\Framework\Services\View;

abstract class MediasController
{
    public static function index(): string
    {
        return View::render('@framework/admin/config/medias.twig');
    }

    public static function upload(): string
    {
        header('Content-Type: application/json');

        if (!isset($_FILES['file'])) {
            http_response_code(400);
            return json_encode(['error' => 'Aucun fichier reçu']);
        }

        try {
            $media = MediaManager::upload($_FILES['file']);

            return json_encode($media);
        } catch (\Exception $e) {
            http_response_code(500);
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function all(int $page = 1): string
    {
        header('Content-Type: application/json');

        $perPage = filter_input(INPUT_GET, 'per_page', FILTER_VALIDATE_INT) ?: 10;

        // Récupère les tags en tant que tableau d'entiers
        $tags = filter_input(INPUT_GET, 'tags', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY) ?? [];
        $tags = array_filter($tags, fn($t) => is_numeric($t)); // nettoyage simple

        $mime_types = filter_input(INPUT_GET, 'mime_types', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY) ?? [];
        $mime_types = array_filter($mime_types, fn($t) => is_string($t)); // nettoyage simple

        try {
            $paginated = \BugQuest\Framework\Services\MediaManager::getPaginated($perPage, $page, $tags, $mime_types);

            return json_encode($paginated);
        } catch (\Exception $e) {
            http_response_code(500);
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function view(int $id): string
    {
        $media = MediaManager::getById($id);

        if (!$media) {
            http_response_code(404);
            return View::render('@framework/error/404.twig');
        }

        return json_encode($media);
    }

    public static function updateMeta(int $id): string
    {
        header('Content-Type: application/json');

        if (empty($id)) {
            http_response_code(400);
            return json_encode(['error' => 'Aucun ID reçu']);
        }

        try {
            $media = MediaManager::getById($id);
            if (!$media) {
                http_response_code(404);
                return json_encode(['error' => 'Media not found']);
            }

            MediaManager::updateMeta($media, filter_input(INPUT_POST, 'meta', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY) ?? []);

            return json_encode(['success' => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function delete(?int $id = null): string
    {
        header('Content-Type: application/json');
        $ids = filter_input(INPUT_POST, 'ids', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY) ?? [];
        $ids = array_filter($ids, fn($t) => is_numeric($t)); // nettoyage simple
        if ($id)
            $ids[] = $id;

        if (empty($ids)) {
            http_response_code(400);
            return json_encode(['error' => 'Aucun fichier reçu']);
        }

        try {
            foreach ($ids as $id) {
                $media = MediaManager::getById($id);
                if ($media) {
                    MediaManager::delete($media);
                }
            }

            return json_encode(['success' => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function addTag(): string
    {
        header('Content-Type: application/json');

        $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_SPECIAL_CHARS);

        if (empty($name)) {
            http_response_code(400);
            return json_encode(['error' => 'Aucun nom reçu']);
        }

        try {
            $tag = MediaManager::addTag($name);

            return json_encode($tag);
        } catch (\Exception $e) {
            http_response_code(500);
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function deleteTag(int $id): string
    {
        header('Content-Type: application/json');

        if (empty($id)) {
            http_response_code(400);
            return json_encode(['error' => 'Aucun ID reçu']);
        }

        try {
            $deleted = MediaManager::deleteTag($id);

            return json_encode(['success' => $deleted]);
        } catch (\Exception $e) {
            http_response_code(500);
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function getTags(): string
    {
        header('Content-Type: application/json');

        try {
            $tags = MediaManager::getTags();

            return json_encode($tags);
        } catch (\Exception $e) {
            http_response_code(500);
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function setTags(int $id): string
    {
        header('Content-Type: application/json');

        if (empty($id)) {
            http_response_code(400);
            return json_encode(['error' => 'Aucun ID reçu']);
        }

        try {
            $media = MediaManager::getById($id);
            if (!$media) {
                http_response_code(404);
                return json_encode(['error' => 'Media not found']);
            }

            $tags = filter_input(INPUT_POST, 'tags', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY) ?? [];

            MediaManager::setTags($media, $tags);

            return json_encode(['success' => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            return json_encode(['error' => $e->getMessage()]);
        }
    }
}