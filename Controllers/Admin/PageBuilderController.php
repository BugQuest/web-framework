<?php

namespace BugQuest\Framework\Controllers\Admin;

use App\Models\Page;
use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Router;
use BugQuest\Framework\Services\Assets;

class PageBuilderController
{
    public static function edit(?int $id = null): Response
    {
        Assets::add(
            group: 'admin',
            id: 'js:admin:page:builder',
            url: '/framework/assets/js/admin-page-builder',
            type: 'js',
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
        ]);
    }

    public static function load(int $id): Response
    {
        $page = Page::find($id);
        if (!$page)
            return Response::json404();

        return Response::json($page);
    }

    public function save(int $id): Response
    {
        $page = Page::findOrFail($id);
        $data = json_decode(file_get_contents('php://input'), true);

        $page->title = $data['title'] ?? '';
        $page->html = $data['html'] ?? '';
        $page->builder_data = $data['builder_data'] ?? [];
        $page->save();

        return Response::jsonSuccess();
    }

    public function list(): Response
    {
        $pages = Page::all();

        return Response::view('@framework/admin/page/list.twig', [
            'pages' => $pages,
        ]);
    }
}