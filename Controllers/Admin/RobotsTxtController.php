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

    public static function add(): Response
    {
        try {
            $data = Payload::fromRawInput()->expectObject([
                'user_agent' => ['string', '*'],
                'directive' => 'string',
                'value' => ['string', ''],
            ]);

            RobotsTxtService::load();

            if (!RobotsTxtService::addEntry($data['user_agent'], $data['directive'], $data['value']))
                throw new \Exception('Invalid data.');

            RobotsTxtService::save();

            return Response::jsonSuccess('Entry added successfully.');
        } catch (\Exception $e) {
            return Response::jsonError($e->getMessage());
        }
    }

    public static function edit(): Response
    {
        try {
            $data = Payload::fromRawInput()->expectObject([
                'user_agent' => ['string', '*'],
                'index' => 'int',
                'directive' => 'string',
                'value' => ['string', ''],
            ]);

            RobotsTxtService::load();

            if (!RobotsTxtService::editEntry($data['user_agent'], $data['index'], $data['directive'], $data['value']))
                throw new \Exception('Invalid data.');

            RobotsTxtService::save('Entry updated successfully.');

            return Response::jsonSuccess();
        } catch (\Exception $e) {
            return Response::jsonError($e->getMessage());
        }
    }

    public static function delete(): Response
    {
        try {
            $data = Payload::fromRawInput()->expectObject([
                'user_agent' => ['string', '*'],
                'index' => 'int',
            ]);

            RobotsTxtService::load();

            if (!RobotsTxtService::deleteEntry($data['user_agent'], $data['index']))
                throw new \Exception('Invalid data.');

            RobotsTxtService::save();

            return Response::jsonSuccess('Entry deleted successfully.');
        } catch (\Exception $e) {
            return Response::jsonError($e->getMessage());
        }
    }
}
