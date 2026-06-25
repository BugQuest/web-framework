<?php

namespace BugQuest\Framework\Library\Twig\Extentions;

use BugQuest\Framework\Models\Database\Media;
use BugQuest\Framework\Models\Route;
use BugQuest\Framework\Router;
use BugQuest\Framework\Services\Admin;
use BugQuest\Framework\Services\Assets;
use BugQuest\Framework\Services\Auth;
use BugQuest\Framework\Services\Hooks;
use BugQuest\Framework\Services\Image;
use BugQuest\Framework\Services\Locale;
use BugQuest\Framework\Services\View;
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
            new TwigFunction('bq_is_route', function (?string $name) {
                return Route::current()?->name === $name;
            }),
            new TwigFunction('bq_route_url', function (?string $name) {
                if ($route = Router::getRoute($name))
                    return $route->getSlug();

                return null;
            }),
            // Locale-aware URL helper: prepends /en when current locale is EN.
            // Use instead of bq_route_url() for links that must follow the user's language.
            new TwigFunction('bq_url', function (?string $name) {
                if (!$name) return null;
                $slug = null;
                if ($route = Router::getRoute($name))
                    $slug = $route->getSlug();
                if ($slug === null) $slug = $name; // fallback: treat as raw path
                if (Locale::getLocale() === 'en') {
                    // Strip leading /en if already present, then re-prepend
                    $slug = '/en' . (str_starts_with($slug, '/en') ? substr($slug, 3) : $slug);
                }
                return $slug;
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
            new TwigFunction('getImageUrl', function (Media|string|int|null $media, string $size = 'original', bool $absolute = false) {
                return Image::getImageUrl($media, $size, $absolute);
            }, [
                'is_safe' => ['html'],
            ]),
            new TwigFunction('getImageHtml', function (Media|string|int|null $media, string $size = 'original', ?string $alt = '', array $attributes = []) {
                return Image::getImageHtml($media, $size, $alt, $attributes);
            }, [
                'is_safe' => ['html'],
            ]),
            new TwigFunction('bq_hook_action', function (string $hook, ...$args) {
                Hooks::runAction($hook, ...$args);
            }, [
                'is_safe' => ['html'],
            ]),
            new TwigFunction('bq_locale_domain', function (string $domain) {
                return Locale::getDomain($domain);
            }),
        ];
    }
}
