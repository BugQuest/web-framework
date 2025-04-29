<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Models\Database\Page;
use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Services\Assets;
use BugQuest\Framework\Services\Payload;

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

    public static function save(int $page_id): Response
    {
        $payload = Payload::fromRawInput()->expectObject([
            'redirect_to' => ['string', ''],
            'no_index' => ['bool', false],
            'no_follow' => ['bool', false],
            'canonical' => ['string', ''],
            'meta' => ['array', []],
            'open_graph' => ['array', []],
            'structured_data' => ['array', []],
            'twitter' => ['array', []]
        ]);

        $page = Page::find($page_id);

        if (!$page)
            return Response::error404();

        if (!$page->seo)
            $page->seo()->create([
                'redirect_to' => '',
                'no_index' => false,
                'no_follow' => false,
                'canonical' => '',
                'meta' => [],
                'open_graph' => [],
                'structured_data' => [],
                'twitter' => []
            ]);

        //use PageSeo ($page->seo()) to save the SEO settings Page hasOne PageSeo
        $page->seo()->update([
            'redirect_to' => $payload['redirect_to'],
            'no_index' => $payload['no_index'],
            'no_follow' => $payload['no_follow'],
            'canonical' => $payload['canonical'],
            'meta' => $payload['meta'],
            'open_graph' => $payload['open_graph'],
            'structured_data' => $payload['structured_data'],
            'twitter' => $payload['twitter']
        ]);


        return Response::jsonSuccess('SEO settings saved successfully', [], ['seo' => $page->seo()]);
    }
}