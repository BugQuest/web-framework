<?php

namespace BugQuest\Framework\Controllers;

use BugQuest\Framework\Models\Database\Page;
use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Models\Route;
use BugQuest\Framework\Services\Admin;
use BugQuest\Framework\Services\Assets;

class OptionPageController
{
    public static function index(): Response
    {
        $page = Admin::getOptionPage(Route::current()?->name);

        if (!$page)
            return Response::error404();

        Assets::add(
            group: 'admin',
            id: 'js:admin:option',
            url: '/framework/assets/js/admin-option',
            type: 'js',
            dependencies: ['js:admin'],
            isLocalUrl: true,
        );

        return Response::view('@framework/admin/config/option.twig', [
            'title' => $page->title,
            'header' => $page->getHeader(),
            'option' => $page->toJson(),
        ]);
    }
}