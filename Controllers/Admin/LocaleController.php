<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Services\Locale;

abstract class LocaleController
{
    /*
     * Récupère le domaine de traduction sous forme de json
     */
    public static function getDomain(string $domain): array
    {
        return Locale::getDomain($domain);
    }
}