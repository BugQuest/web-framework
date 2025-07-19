<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Models\Database\Media;
use BugQuest\Framework\Models\Database\Tag;
use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Services\Assets;
use BugQuest\Framework\Services\Image;
use BugQuest\Framework\Services\MediaManager;
use BugQuest\Framework\Services\Payload;
use BugQuest\Framework\Services\View;
use mysql_xdevapi\SqlStatementResult;

abstract class MediasController
{
    public static function index(): string
    {
        Assets::add(
            group: 'admin',
            id: 'js:admin:page:media',
            url: '/framework/assets/js/admin-page-media',
            type: 'js',
            dependencies: ['js:admin'],
            isLocalUrl: true,
        );

        return View::render('@framework/admin/config/medias.twig');
    }

    public static function upload(): Response
    {
        if (!isset($_FILES['file']))
            return Response::jsonError('Aucun fichier reçu');

        $meta = filter_input(INPUT_POST, 'meta', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY) ?? [];
        $tags = filter_input(INPUT_POST, 'tags', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY) ?? [];
        $tags = array_filter($tags, fn($t) => is_string($t)); // nettoyage simple

        try {
            return Response::json(MediaManager::upload($_FILES['file'], $meta, $tags));
        } catch (\Exception $e) {
            return Response::jsonServerError($e->getMessage());
        }
    }

    public static function all(int $page = 1): Response
    {
        $perPage = filter_input(INPUT_GET, 'per_page', FILTER_VALIDATE_INT) ?: 10;

        // Récupère les tags en tant que tableau d'entiers
        $tags = filter_input(INPUT_GET, 'tags', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY) ?? [];
        $tags = array_filter($tags, fn($t) => is_numeric($t)); // nettoyage simple

        $forced_tags = filter_input(INPUT_GET,'forced_tags', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY) ?? [];
        $forced_tags = array_filter($forced_tags, fn($t) => is_string($t));
        if (!empty($forced_tags)) {
            //forced tags is list of strings, find their IDs
            $tags = array_merge($tags, Tag::whereIn('name', $forced_tags)->pluck('id')->toArray());
        }


        $mime_types = filter_input(INPUT_GET, 'mime_types', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY) ?? [];
        $mime_types = array_filter($mime_types, fn($t) => is_string($t)); // nettoyage simple

        try {
            return Response::json(MediaManager::getPaginated($perPage, $page, $tags, $mime_types));
        } catch (\Exception $e) {
            return Response::jsonServerError($e->getMessage());
        }
    }

    public static function view(int $id): Response
    {
        $media = MediaManager::getById($id);

        if (!$media)
            return Response::error404();

        return Response::json($media);
    }

    public static function updateMeta(int $id): Response
    {
        if (empty($id))
            return Response::jsonError('Aucun ID reçu');

        try {
            $media = MediaManager::getById($id);
            if (!$media)
                return Response::json404('Media not found');

            MediaManager::updateMeta($media, filter_input(INPUT_POST, 'meta', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY) ?? []);

            return Response::jsonSuccess();
        } catch (\Exception $e) {
            return Response::jsonServerError($e->getMessage());
        }
    }

    public static function delete(?int $id = null): Response
    {
        $ids = filter_input(INPUT_POST, 'ids', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY) ?? [];
        $ids = array_filter($ids, fn($t) => is_numeric($t)); // nettoyage simple
        if ($id)
            $ids[] = $id;

        if (empty($ids))
            return Response::jsonError('Aucun ID reçu');

        try {
            foreach ($ids as $id)
                if ($media = MediaManager::getById($id))
                    MediaManager::delete($media);

            return Response::jsonSuccess();
        } catch (\Exception $e) {
            return Response::jsonServerError($e->getMessage());
        }
    }

    public static function addTag(): Response
    {
        $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_SPECIAL_CHARS);

        if (empty($name))
            return Response::jsonError('Aucun nom reçu');

        try {
            return Response::json(MediaManager::addTag($name));
        } catch (\Exception $e) {
            return Response::jsonServerError($e->getMessage());
        }
    }

    public static function deleteTag(int $id): Response
    {
        if (empty($id))
            return Response::jsonError('Aucun ID reçu');

        try {
            return Response::json([
                'success' => MediaManager::deleteTag($id),
            ]);
        } catch (\Exception $e) {
            return Response::jsonServerError($e->getMessage());
        }
    }

    public static function getTags(): Response
    {
        try {
            $tags = MediaManager::getTags();

            return Response::json($tags->toArray());
        } catch (\Exception $e) {
            return Response::jsonServerError($e->getMessage());
        }
    }

    public static function setTags(int $id): Response
    {
        if (empty($id)) {
            return Response::jsonError('Aucun ID reçu');
        }

        try {
            $media = MediaManager::getById($id);
            if (!$media) {
                return Response::json404('Media not found');
            }

            $tags = filter_input(INPUT_POST, 'tags', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY) ?? [];

            MediaManager::setTags($media, $tags);

            return Response::jsonSuccess();
        } catch (\Exception $e) {
            return Response::jsonServerError($e->getMessage());
        }
    }

    public static function resize(int $id): Response
    {
        $payload = Payload::fromRawInput()->expectObject(
            [
                'compression_method' => ['string', 'auto'],
                'size' => ['string', 'original'],
            ]
        );

        $compression_method = $payload['compression_method'] ?? 'auto';
        $size = $payload['size'] ?? 'original';

        $media = MediaManager::getById($id);
        if (!$media)
            return Response::json404('Media not found');

        try {
            return Response::json(['url' => $media->imageUrl($size, false, $compression_method)]);
        } catch (\Exception $e) {
            return Response::jsonServerError($e->getMessage());
        }
    }

    public static function sizes(): Response
    {
        return Response::json(Image::getSizes());
    }
}