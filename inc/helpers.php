<?php

use BugQuest\Framework\Models\Database\Meta;
use BugQuest\Framework\Services\Locale;
use BugQuest\Framework\Services\MetaService;

if (!function_exists('get_locale')) {
    function get_locale(): string
    {
        return Locale::getLocale();
    }
}

if (!function_exists('set_locale')) {
    function set_locale(string $locale): void
    {
        Locale::setLocale($locale);
    }
}

if (!function_exists('__')) {
    function __(string $original, string $domain = 'BugQuest', ?string $locale = null, array $replacements = []): string
    {
        return Locale::translate($original, $domain, $locale, $replacements);
    }
}

function gdd(...$args): void
{
    //clean ob
    if (ob_get_length())
        ob_end_clean();

    foreach ($args as $arg)
        dump($arg);

    die();
}


function update_meta(string $key, string $value): void
{
    MetaService::update($key, $value);
}