<?php

namespace BugQuest\Framework\Controllers\Admin;


use BugQuest\Framework\Services\OptionService;
use BugQuest\Framework\Services\View;

abstract class OptionController
{

    public static function get(string $group, ?string $key = null): string
    {
        header('Content-Type: application/json');
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $default = $input['default'] ?? null;

            return json_encode(OptionService::get($group, $key, $default));
        } catch (\Exception $e) {
            http_response_code(500);
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    /*
     * @param string $group
     * @param string|null $key
     * @return string
     * if $key is null, it will get json of all options in the group and set it
     * if $key is not null, it will set the value of the key in the group
     */
    public static function set(string $group, ?string $key = null): string
    {
        header('Content-Type: application/json');
        try {
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input) {
                http_response_code(400);
                return json_encode(['error' => 'Aucune donnée reçue.']);
            }

            if ($key === null) {
                OptionService::setGroup($group, $input);
            } else {
                $value = $input['value'] ?? null;
                $type = $input['type'] ?? null;

                if (!$type) {
                    http_response_code(400);
                    return json_encode(['error' => 'Type manquant.']);
                }

                OptionService::set($group, $key, $type, $value);
            }

            return json_encode(['success' => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            return json_encode(['error' => $e->getMessage()]);
        }
    }

    public static function delete(string $group, string $key): string
    {
        header('Content-Type: application/json');
        try {
            OptionService::delete($group, $key);
            return json_encode(['success' => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            return json_encode(['error' => $e->getMessage()]);
        }
    }
}
