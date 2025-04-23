import './components/dropdown';
import './components/accordeon';
import './components/language-switcher';
import MediaGallery from './components/MediaGallery';
import {Tooltip} from './components/Tooltip.js';
import {Translator} from './components/Translator.js';

document.addEventListener('DOMContentLoaded', async () => {

    await Translator.load('admin');

    Tooltip.setup();
    const mediaGalleries = document.querySelectorAll('.__media_gallery');
    mediaGalleries.forEach(gallery => {
        new MediaGallery(gallery);
    });

    console.log('%c[Admin] JS chargé avec succès 🛠️', 'color: cyan; font-weight: bold');
});