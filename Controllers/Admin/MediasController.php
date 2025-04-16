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

            echo json_encode($media);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function all(?int $page = null): void
    {
        header('Content-Type: application/json');

        $perPage = 24;
        $page = $page ?? (int)($_GET['page'] ?? 1);
        $tagFilter = $_GET['tag'] ?? null;

        try {
            $paginated = MediaManager::getPaginated($perPage, $page, $tagFilter);

            echo json_encode($paginated);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function view(int $id): string
    {
        $media = MediaManager::getById($id);

        if (!$media) {
            http_response_code(404);
            return View::render('@framework/error/404.twig');
        }

        return View::render('@framework/admin/partials/media-view.twig', [
            'media' => $media,
        ]);
    }
}