<?php

namespace BugQuest\Framework\Controllers\Admin;

use BugQuest\Framework\Models\Response;
use BugQuest\Framework\Services\Assets;
use BugQuest\Framework\Services\Payload;
use BugQuest\Framework\Services\RobotsTxtService;

class RobotsTxtController
{
    public static function admin(): Response
    {
        Assets::add(
            group: 'admin',
            id: 'js:admin:page:robots-txt',
            url: '/framework/assets/js/admin-page-robots-txt',
            type: 'js',
            dependencies: ['js:admin'],
            isLocalUrl: true,
        );

        return Response::view('@framework/admin/config/robots-txt.twig');
    }

    public static function index(): Response
    {
        return Response::plaintext(RobotsTxtService::getContent());
    }

    public static function list(): Response
    {
        try {
            RobotsTxtService::load();

            return Response::json([
                'success' => true,
                'entries' => RobotsTxtService::getEntries(),
            ]);
        } catch (\Exception $e) {
            return Response::jsonError($e->getMessage());
        }
    }

    public static function save(): Response
    {
        try {
            $data = Payload::fromRawInput()->expectArrayOf([
                'user_agent' => 'string',
                'directive' => 'string',
                'value' => 'string',
            ]);


            RobotsTxtService::clear(); // On réinitialise tout

            foreach ($data as $entry) {
                if (!is_array($entry) ||
                    !isset($entry['user_agent'], $entry['directive'], $entry['value'])) {
                    throw new \Exception('Invalid entry format.');
                }

                $userAgent = trim($entry['user_agent']);
                $directive = trim($entry['directive']);
                $value = trim($entry['value']);

                if ($userAgent === '')
                    $userAgent = '*';

                if (!RobotsTxtService::isValidDirective($directive))
                    throw new \Exception('Invalid directive: ' . htmlspecialchars($directive));

                RobotsTxtService::addEntry($userAgent, $directive, $value);
            }

            RobotsTxtService::save();

            return Response::jsonSuccess();
        } catch (\Exception $e) {
            return Response::jsonError($e->getMessage());
        }
    }
}
