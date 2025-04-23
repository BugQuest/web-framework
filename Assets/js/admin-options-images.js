import {ImageOptionsPage} from '@framework/js/options/ImageOptionsPage.js';
import {LazySmooth} from '@framework/js/services/LazySmooth.js';

document.addEventListener('bqAdminLoaded', async () => {
    await new ImageOptionsPage()?.init();

    console.log('%c[Admin] ImageOptionsPage initialisé avec succès 🖼️', 'color: cyan; font-weight: bold');
    LazySmooth.process();
});