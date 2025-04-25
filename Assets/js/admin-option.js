import AutoOptionsPage from '@framework/js/options/AutoOptionsPage';
import {LazySmooth} from '@framework/js/services/LazySmooth.js';

document.addEventListener('bqAdminLoaded', async () => {
    await new AutoOptionsPage()?.init();

    console.log('%c[Admin] AutoOptionsPage initialisé avec succès', 'color: cyan; font-weight: bold');
    LazySmooth.process();
});