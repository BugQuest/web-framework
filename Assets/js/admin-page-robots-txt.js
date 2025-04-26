import RobotsManager from '@framework/js/components/RobotsManager';

document.addEventListener('bqAdminLoaded', async () => {
    const container = document.getElementById('robots-manager');
    if (!container) {
        console.warn('RobotsManager: Container not found');
        return;
    }
    const robots = new RobotsManager(container);
    await robots.init();
    console.log('%c[Admin] RobotsManager initialisé avec succès', 'color: cyan; font-weight: bold');
});