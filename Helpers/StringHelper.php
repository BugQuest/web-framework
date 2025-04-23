<?php

namespace BugQuest\Framework\Helpers;

class StringHelper
{
    /**
     * Nettoie une chaîne de caractères :
     * - supprime les balises HTML
     * - convertit les entités HTML
     * - supprime les caractères invisibles
     * - trim les espaces
     */
    public static function sanitize_str(string $input): string
    {
        $input = strip_tags($input);
        $input = htmlspecialchars($input, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $input = preg_replace('/[\x00-\x1F\x7F]/u', '', $input); // caractères de contrôle
        return trim($input);
    }

    public static function sanitize_title(string $title): string
    {
        // Convertir les caractères spéciaux en ASCII
        $title = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $title);
        $title = strtolower($title);

        // Remplacer tout ce qui n'est pas lettre, chiffre ou tiret par un espace
        $title = preg_replace('/[^a-z0-9]+/', '-', $title);

        // Supprimer les tirets en trop
        $title = preg_replace('/-+/', '-', $title);

        return trim($title, '-');
    }
}
