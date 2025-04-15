<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Services\MediaManager;
use BugQuest\Framework\Services\View;

abstract class MediasController
{
    public static function index(): string
    {
        $perPage = 24;
        $page = (int)($_GET['page'] ?? 1);
        $tagFilter = $_GET['tag'] ?? null;

        $paginated = MediaManager::getPaginated($perPage, $page, $tagFilter);
        return View::render('@framework/admin/config/medias.twig', [
            'media_paginated' => $paginated,
        ]);
    }

    public static function upload(): void
    {
        header('Content-Type: application/json');

        if (!isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Aucun fichier reçu']);
            return;
        }

        try {
            $media = MediaManager::upload($_FILES['file']);

            echo json_encode([
                'id' => $media->id,
                'url' => '/' . $media->path, // ou ajuster selon ton système
                'name' => $media->original_name,
                'mime' => $media->mime_type,
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

}