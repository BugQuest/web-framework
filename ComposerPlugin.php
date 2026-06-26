<?php

namespace BugQuest\Framework;

use Composer\Composer;
use Composer\EventDispatcher\EventSubscriberInterface;
use Composer\IO\IOInterface;
use Composer\Plugin\PluginInterface;
use Composer\Script\Event;
use Composer\Script\ScriptEvents;

class ComposerPlugin implements PluginInterface, EventSubscriberInterface
{
    public function activate(Composer $composer, IOInterface $io): void {}
    public function deactivate(Composer $composer, IOInterface $io): void {}
    public function uninstall(Composer $composer, IOInterface $io): void {}

    public static function getSubscribedEvents(): array
    {
        return [
            ScriptEvents::POST_INSTALL_CMD => 'installBqCli',
            ScriptEvents::POST_UPDATE_CMD  => 'installBqCli',
        ];
    }

    public static function installBqCli(Event $event): void
    {
        $rootDir = dirname($event->getComposer()->getConfig()->get('vendor-dir'));
        $target  = $rootDir . '/bq-cli';

        if (file_exists($target)) {
            return;
        }

        $source = __DIR__ . '/bq-cli';

        if (!file_exists($source)) {
            $event->getIO()->writeError('<warning>[bq-cli] Template introuvable dans le framework.</warning>');
            return;
        }

        if (!copy($source, $target)) {
            $event->getIO()->writeError('<error>[bq-cli] Impossible de copier le fichier.</error>');
            return;
        }

        chmod($target, 0755);

        $event->getIO()->write('<info>✓ bq-cli copié à la racine du projet (php bq-cli help)</info>');
    }
}
