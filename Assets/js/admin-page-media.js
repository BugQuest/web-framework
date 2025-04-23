import MediaGallery from '@framework/js/components/MediaGallery';

document.addEventListener('bqAdminLoaded', () => {
    const mediaGalleries = document.querySelectorAll('.__media_gallery');
    mediaGalleries.forEach(gallery => {
        new MediaGallery(gallery);
    });

    console.log('%c[Admin] MediaGallery initialisé avec succès 🖼️', 'color: cyan; font-weight: bold');
});