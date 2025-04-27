<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Models\Database\Page;
use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Services\Assets;
use BugQuest\Framework\Services\OptionService;
use BugQuest\Framework\Services\Payload;
use Illuminate\Support\Facades\DB;

class PageListController
{
    public static function index(): Response
    {
        Assets::add(
            group: 'admin',
            id: 'js:admin:page:list',
            url: '/framework/assets/js/admin-page-list',
            type: 'js',
            dependencies: ['js:admin'],
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
                'status' => ['array', []],
                'search' => ['string', ''],
            ]);
        } catch (\Exception $e) {
            return Response::jsonError('Invalid data : ' . $e->getMessage());
        }

        $page = max(1, $payload['page']);
        $perPage = max(1, min(100, $payload['per_page']));
        $statusFilter = $payload['status'];
        $search = $payload['search'];

        // Base de la requête
        $query = Page::orderBy('order');

        // Appliquer un filtre sur status si présent
        if ($statusFilter)
            $query->whereIn('status', $statusFilter);

        //search
        if ($search)
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', '%' . $search . '%')
                    ->orWhere('slug', 'LIKE', '%' . $search . '%');
            });

        // Nombre total (avec filtre éventuel)
        $total = $query->count();

        // Récupérer les pages paginées
        $pages = $query
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        // Compter les statuts (tous, sans filtre)
        $statusCounts = Page::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        return Response::json([
            'homepage' => OptionService::get('cms', 'homepage')?->id,
            'pages' => $pages,
            'total' => $total,
            'per_page' => $perPage,
            'current_page' => $page,
            'last_page' => (int)ceil($total / $perPage),
            'filters' => [
                'status' => $statusCounts,
            ],
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
                $page = Page::find($item['id']);
                $page->order = $item['order'];
                $page->parent_id = $parentId;
                $page->resolveUrl();
            }

        return Response::json(['success' => true]);
    }

    public static function search(): Response
    {
        try {
            $payload = Payload::fromRawInput()->expectObject([
                'search' => 'string',
            ]);

            $search = $payload['search'] ?? '';

            $query = Page::where('title', 'LIKE', '%' . $search . '%')
                ->orWhere('slug', 'LIKE', '%' . $search . '%')
                ->orderBy('order')
                ->get();

            return Response::json($query);
        } catch (\Exception $e) {
            return Response::jsonError('Invalid data : ' . $e->getMessage());
        }
    }
}