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
        // Convertir en minuscules avec support UTF-8
        $title = mb_strtolower($title, 'UTF-8');

        // Remplacer les caractères accentués courants (fallback si iconv échoue ou n'est pas dispo)
        $replacements = [
            'à' => 'a', 'â' => 'a', 'ä' => 'a', 'á' => 'a', 'ã' => 'a', 'å' => 'a',
            'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e',
            'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i',
            'ò' => 'o', 'ó' => 'o', 'ô' => 'o', 'õ' => 'o', 'ö' => 'o',
            'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ü' => 'u',
            'ñ' => 'n', 'ç' => 'c',
            'œ' => 'oe', 'æ' => 'ae',
            'ß' => 'ss',
        ];
        $title = strtr($title, $replacements);

        // Fallback supplémentaire avec iconv (si dispo)
        if (function_exists('iconv')) {
            $converted = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $title);
            if ($converted !== false) {
                $title = $converted;
            }
        }

        // Remplacer tout ce qui n'est pas lettre, chiffre ou tiret par un tiret
        $title = preg_replace('/[^a-z0-9]+/', '-', $title);

        // Supprimer les tirets en double ou en trop
        $title = preg_replace('/-+/', '-', $title);

        // Nettoyage final
        return trim($title, '-');
    }
}
