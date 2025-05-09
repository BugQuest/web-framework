<?php

namespace BugQuest\Framework\Services;

use BugQuest\Framework\Models\Database\Page;

class PageService
{
    /**
     * @var Page|null
     */
    protected static ?Page $currentPage = null;

    protected static string $theme = 'default';

    /**
     * Définit la page courante
     *
     * @param Page $page
     */
    public static function setCurrent(Page $page): void
    {
        self::$currentPage = $page;
    }

    /**
     * Récupère la page courante
     *
     * @return Page|null
     */
    public static function getCurrent(): ?Page
    {
        return self::$currentPage;
    }

    /**
     * Définit le thème courant
     *
     * @param string $theme
     */
    public static function setTheme(string $theme): void
    {
        self::$theme = $theme;
    }

    /**
     * Récupère le thème courant
     *
     * @return string
     */
    public static function getTheme(): string
    {
        return self::$theme;
    }

    /**
     * Récupère le contenu HTML (body uniquement)
     *
     * @return string|null
     */
    public static function getBodyHtml(): ?string
    {
        $html = self::$currentPage?->html;

        if (!$html) return null;

        preg_match('/<body[^>]*>(.*?)<\/body>/is', $html, $matches);

        return $matches[1] ?? null;
    }

    /**
     * Récupère le style CSS contenu dans la balise <style>
     *
     * @return string|null
     */
    public static function getStyle(): ?string
    {
        $html = self::$currentPage?->html;

        if (!$html) return null;

        preg_match('/<style[^>]*>(.*?)<\/style>/is', $html, $matches);

        return $matches[1] ?? null;
    }

    /**
     * Récupère le builder_data en tableau
     *
     * @return array|null
     */
    public static function getBuilderData(): ?array
    {
        return self::$currentPage?->builder_data;
    }
}
