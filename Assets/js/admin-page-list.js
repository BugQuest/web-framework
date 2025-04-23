import {PageListManager} from '@framework/js/page-builder/PageListManager.js';

document.addEventListener('bqAdminLoaded', () => {
    new PageListManager(document.querySelector('#page-list'));

    console.log('%c[Admin] PageListManager initialisé avec succès 🖼️', 'color: cyan; font-weight: bold');
});