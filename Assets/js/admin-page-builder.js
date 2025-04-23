import PageBuilder from '@framework/js/page-builder/PageBuilder';

document.addEventListener('bqAdminLoaded', async () => {
    const el = document.querySelector('#gjs');
    if (!el) return;

    const pageBuilder = new PageBuilder(el);
    await pageBuilder.initEditor();

    console.log('%c[Admin] PageBuilder initialisé avec succès 🖼️', 'color: cyan; font-weight: bold');
});