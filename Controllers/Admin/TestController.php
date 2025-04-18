<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Services\Locale;
use BugQuest\Framework\Services\View;

abstract class TestController
{
    public static function index()
    {
        return View::render('@framework/admin/config/test.twig');
    }
}