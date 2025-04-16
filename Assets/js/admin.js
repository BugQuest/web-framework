import './components/dropdown';
import './components/accordeon';
import './components/language-switcher';
import MediaGallery from './components/MediaGallery';

document.addEventListener('DOMContentLoaded', () => {
    const mediaGalleries = document.querySelectorAll('.__media_gallery');
    mediaGalleries.forEach(gallery => {
        new MediaGallery(gallery);
    });

    console.log('%c[Admin] JS chargé avec succès 🛠️', 'color: cyan; font-weight: bold');
});
