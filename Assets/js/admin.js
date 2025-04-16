import './components/dropdown';
import './components/accordeon';
import './components/language-switcher';
import MediaUploader from './components/MediaUploader';
import Gallery from './components/Gallery';
import MediaGalleryLoader from './components/MediaGalleryLoader';
import MediaModal from './components/MediaModal';

document.addEventListener('DOMContentLoaded', () => {
    const galleryElement = document.querySelector('.media-gallery');
    const gridElement = document.querySelector('.__mediaGrid');

    if (galleryElement) {
        new Gallery(); // auto-annulé si la grille existe déjà
        new MediaGalleryLoader();
        new MediaModal();
    }

    if (gridElement) {
        new MediaUploader();
    }

    console.log('%c[Admin] JS chargé avec succès 🛠️', 'color: cyan; font-weight: bold');
});
