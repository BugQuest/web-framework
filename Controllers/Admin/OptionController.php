<?php

namespace BugQuest\Framework\Controllers\Admin;


use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Services\OptionService;

abstract class OptionController
{

    public static function get(string $group, ?string $key = null): Response
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            $default = $input['default'] ?? null;

            return Response::json(OptionService::get($group, $key, $default));
        } catch (\Exception $e) {
            return Response::jsonServerError($e->getMessage());
        }
    }

    /*
     * @param string $group
     * @param string|null $key
     * @return string
     * if $key is null, it will get json of all options in the group and set it
     * if $key is not null, it will set the value of the key in the group
     */
    public static function set(string $group, ?string $key = null): Response
    {
        try {
            $input = json_decode(file_get_contents('php://input'), true);

            if (!$input)
                return Response::jsonError('Erreur de décodage JSON.');


            if ($key === null) {
                OptionService::setGroup($group, $input);
            } else {
                $value = $input['value'] ?? null;
                $type = $input['type'] ?? null;

                if (!$type) {
                    return Response::jsonError("Type obligatoire");
                }

                OptionService::set($group, $key, $type, $value);
            }

            return Response::jsonSuccess();
        } catch (\Exception $e) {
            return Response::jsonServerError($e->getMessage());
        }
    }

    public static function delete(string $group, string $key): Response
    {
        header('Content-Type: application/json');
        try {
            OptionService::delete($group, $key);
            return Response::jsonSuccess();
        } catch (\Exception $e) {
            return Response::jsonServerError($e->getMessage());
        }
    }
}
