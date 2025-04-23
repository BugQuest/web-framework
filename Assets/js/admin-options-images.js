import {ImageOptionsPage} from '@framework/js/options/ImageOptionsPage.js';

document.addEventListener('bqAdminLoaded', async () => {
    await new ImageOptionsPage()?.init();

    console.log('%c[Admin] ImageOptionsPage initialisé avec succès 🖼️', 'color: cyan; font-weight: bold');
});