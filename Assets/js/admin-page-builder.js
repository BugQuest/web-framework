import PageBuild from '@framework/js/page-builder/PageBuilder';

document.addEventListener('DOMContentLoaded', async () => {
    const el = document.querySelector('#gjs');
    if (!el) return;

    const pageBuilder = new PageBuild(el);
    await pageBuilder.initEditor();
});