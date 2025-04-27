<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Models\Database\Page;
use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Services\Assets;

class PageSeoController
{
    public static function index(int $page_id): Response
    {
        $page = Page::find($page_id);

        if (!$page)
            return Response::error404();

        $page->seo();

        Assets::add(
            group: 'admin',
            id: 'js:admin:page:seo',
            url: '/framework/assets/js/admin-page-seo',
            type: 'js',
            dependencies: ['js:admin'],
            isLocalUrl: true,
        );

        return Response::view('@framework/admin/page/seo.twig', [
            'page' => $page,
            'page_encoded' => json_encode($page),
        ]);
    }
}