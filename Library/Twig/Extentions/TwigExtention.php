<?php

namespace BugQuest\Framework\Library\Twig\Extentions;

use BugQuest\Framework\Models\Route;
use BugQuest\Framework\Router;
use BugQuest\Framework\Services\Admin;
use BugQuest\Framework\Services\Assets;
use BugQuest\Framework\Services\Auth;
use BugQuest\Framework\Services\Locale;
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
            new TwigFunction('__', function (string $original, string $domain = 'BugQuest', ?string $locale = null, array $replacements = []) {
                return Locale::translate($original, $domain, $locale, $replacements);
            }, [
                'is_safe' => ['html'],
            ]),
            new TwigFunction('bq_locale', function () {
                return Locale::getLocale();
            }, [
                'is_safe' => ['html'],
            ]),
            new TwigFunction('bq_user', function () {
                return Auth::user();
            }),
        ];
    }
}
