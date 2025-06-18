<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Helpers\StringHelper;
use BugQuest\Framework\Models\Database\Page;
use BugQuest\Framework\Models\Response;
use BugQuest\Framework\PageBuilder\BlockRegistry;
use BugQuest\Framework\Services\Assets;
use BugQuest\Framework\Services\PageService;
use BugQuest\Framework\Services\Payload;

class PageBuilderController
{
    public static function edit(?int $id = null): Response
    {
        Assets::add(
            group: 'admin',
            id: 'js:admin:page:builder',
            url: '/framework/assets/js/admin-page-builder',
            type: 'js',
            dependencies: ['js:admin'],
            isLocalUrl: true,
        );

        Assets::add(
            group: 'admin',
            id: 'css:admin:page:builder',
            url: '/framework/assets/css/admin-page-builder',
            type: 'css',
            isLocalUrl: true,
        );

        return Response::view('@framework/admin/page/edit.twig', [
            'page' => $id,
            'blocks' => BlockRegistry::toJS(),
            'theme' => PageService::getTheme(),
        ]);
    }

    public static function renderBlock(string $type): Response
    {
        $block = BlockRegistry::get($type);

        if (!$block)
            return Response::json404('Block not found');

        try {
            return Response::html($block->renderCallback(Payload::fromRawInput()->getRaw()));
        } catch (\Exception $e) {
            return Response::jsonServerException($e);
        }
    }

    public static function load(int $id): Response
    {
        $page = Page::find($id);
        if (!$page)
            return Response::json404();

        return Response::json($page);
    }

    public static function save(?int $id = null): Response
    {
        try {
            $payload = Payload::fromRawInput()->expectObject([
                'title' => 'string',
                'slug' => ['string', null],
                'html' => ['string', ''],
                'builder_data' => ['array', []],
            ]);
        } catch (\Exception $e) {
            return Response::jsonError('Invalid data : ' . $e->getMessage());
        }

        if (!isset($payload['title']) || !isset($payload['html']))
            return Response::jsonError('Missing title or html');

        if (!$id) {
            $page = new Page();
        } else {
            $page = Page::find($id);
            if (!$page)
                return Response::json404();
        }

        $slug = $payload['slug'] ?: StringHelper::sanitize_title($payload['title']);
        $page->title = $payload['title'] ?? '';
        $page->slug = $slug;
        $page->html = $payload['html'] ?? '';
        $page->css = $payload['css'] ?? '';
        $page->builder_data = $payload['builder_data'] ?? [];
        $page->status = $payload['status'] ?? 'draft';
        $page->order = $payload['order'] ?? 0;
        if (!$page->resolveUrl())
            $page->save();

        return Response::json($page);
    }

    public static function status(int $id, string $status): Response
    {
        try {
            $page = Page::find($id);
            if (!$page)
                return Response::json404();

            $page->setStatus($status);

            return Response::json($page);
        } catch (\Exception $e) {
            return Response::jsonError('Invalid data : ' . $e->getMessage());
        }
    }
}