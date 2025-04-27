import PageSeo from '@framework/js/page-builder/PageSeo';

document.addEventListener('bqAdminLoaded', async () => {
    const pageSeoElements = document.querySelectorAll('.__page-seo');
    pageSeoElements.forEach(element => {
        const pageSeo = new PageSeo(element);
        pageSeo.render();
    });

    console.log('%c[Admin] PageSeo initialisé avec succès', 'color: cyan; font-weight: bold');
});