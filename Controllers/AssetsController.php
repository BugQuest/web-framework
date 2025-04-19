<?php

namespace BugQuest\Framework\Controllers;

use BugQuest\Framework\Models\Response;

class AssetsController
{
    public static function js(string $name): Response
    {
        return Response::frameworkJS($name);
    }

    public static function jsMap(string $name): Response
    {
        return Response::frameworkJSMap($name);
    }

    public static function css(string $name): Response
    {
        return Response::frameworkCSS($name);
    }

    public static function cssMap(string $name): Response
    {
        return Response::frameworkCSSMap($name);
    }
}