import '@framework/js/components/dropdown';
import {Accordion} from '@framework/js/components/Accordion.js';
import '@framework/js/components/language-switcher';
import MediaGallery from '@framework/js/components/MediaGallery';
import {Tooltip} from '@framework/js/services/Tooltip.js';
import {Translator} from '@framework/js/services/Translator.js';
import {DebugPanel} from '@framework/js/services/DebugPanel';
import {LazySmooth} from '@framework/js/services/LazySmooth.js';

document.addEventListener('DOMContentLoaded', async () => {

    await Translator.load('admin');
    await DebugPanel.init();
    Accordion.setup();
    Tooltip.setup();

    //sleep 100ms
    await new Promise(resolve => setTimeout(resolve, 50));
    //call event admin_loaded
    document.dispatchEvent(new CustomEvent('bqAdminLoaded'));

    console.log('%c[Admin] JS chargé avec succès 🛠️', 'color: cyan; font-weight: bold');

    //sleep 100ms
    await new Promise(resolve => setTimeout(resolve, 100));
    LazySmooth.process();
});