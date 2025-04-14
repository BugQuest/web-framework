<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Services\View;

abstract class ImagesController
{
    public static function index()
    {
        return View::render('@framework/admin/config/images.twig', [
        ]);
    }
}