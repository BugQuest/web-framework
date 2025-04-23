<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Models\Database\Page;
use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Services\Assets;
use BugQuest\Framework\Services\Payload;

class PageListController
{
    public static function index(): Response
    {
        Assets::add(
            group: 'admin',
            id: 'js:admin:page:list',
            url: '/framework/assets/js/admin-page-list',
            type: 'js',
            isLocalUrl: true,
        );

        return Response::view('@framework/admin/page/list.twig');
    }

    public static function list(): Response
    {
        try {
            $payload = Payload::fromRawInput()->expectObject([
                'page' => ['int', 1],
                'per_page' => ['int', 20],
            ]);
        } catch (\Exception $e) {
            return Response::jsonError('Invalid data : ' . $e->getMessage());
        }

        $page = max(1, $payload['page']);
        $perPage = max(1, min(100, $payload['per_page']));

        $query = Page::orderBy('order');
        $total = $query->count();

        $pages = $query
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        return Response::json([
            'pages' => $pages,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => (int)ceil($total / $perPage),
        ]);
    }

    // POST /admin/api/page/hierachy
    public static function hierachy(): Response
    {
        try {
            $payload = Payload::fromRawInput()->expectArrayOf([
                'id' => 'int',
                'order' => 'int',
                'parent_id' => ['int|null', null],
            ]);
        } catch (\Exception $e) {
            return Response::jsonError('Invalid data : ' . $e->getMessage());
        }


        foreach ($payload as $item)
            if (isset($item['id'], $item['order'])) {
                $parentId = $item['parent_id'] ?? null;
                Page::where('id', $item['id'])->update([
                    'parent_id' => $parentId,
                    'order' => $item['order']
                ]);
            }

        return Response::json(['success' => true]);
    }
}