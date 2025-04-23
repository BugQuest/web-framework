<?php

namespace BugQuest\Framework\Controllers\Admin;


use BugQuest\Framework\Services\OptionService;
use BugQuest\Framework\Services\View;

abstract class OptionController
{
    public static function get(string $group): string
    {
        header('Content-Type: application/json');
        try {
            return json_encode(OptionService::get($group));
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
            $input = file_get_contents('php://input');

            if ($key === null) {
                $data = json_decode($input, true);

                if (!is_array($data)) {
                    http_response_code(400);
                    return json_encode(['error' => 'Format JSON invalide.']);
                }

                OptionService::setGroup($group, $data);
            } else {
                OptionService::set($group, $key, $input);
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
