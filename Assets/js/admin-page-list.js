import { PageListManager } from './page-builder/PageListManager.js';

document.addEventListener('DOMContentLoaded', () => {
    new PageListManager(document.querySelector('#page-list'));
});