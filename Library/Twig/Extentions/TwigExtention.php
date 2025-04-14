<?php

namespace BugQuest\Framework\Library\Twig\Extentions;

use BugQuest\Framework\Models\Route;
use BugQuest\Framework\Router;
use BugQuest\Framework\Services\Admin;
use BugQuest\Framework\Services\Assets;
use Twig\TwigFunction;

class TwigExtention extends \Twig\Extension\AbstractExtension implements \Twig\Extension\GlobalsInterface
{
    public function getGlobals(): array
    {
        return [
        ];
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('bq_assets_header', function (string $group) {
                return Assets::renderHeader($group);
            }, [
                'is_safe' => ['html'],
            ]),
            new TwigFunction('bq_assets_footer', function (string $group) {
                return Assets::renderFooter($group);
            }, [
                'is_safe' => ['html'],
            ]),
            new TwigFunction('bq_is_route', function (string $name) {
                return Route::current()?->name === $name;
            }),
            new TwigFunction('bq_route_url', function (string $name) {
                if ($route = Router::getRoute($name))
                    return $route->getSlug();

                return null;
            }),
            new TwigFunction('bq_admin_menu', function () {
                return Admin::renderMenu();
            }, [
                'is_safe' => ['html'],
            ]),
        ];
    }
}
