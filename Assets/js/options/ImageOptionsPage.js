import {OptionsPage} from './OptionsPage';
import {__} from '@framework/js/services/Translator';
import Builder from '@framework/js/services/Builder';

export class ImageOptionsPage extends OptionsPage {
    constructor() {
        super('images');
    }

    render() {
        if(!this.container) return;

        let compression_methods = [];
        try {
            compression_methods = JSON.parse(this.container.dataset.compressionMethods);
        } catch (e) {
            console.error('Error parsing compression methods:', e);
        }

        const wrapper = Builder.div('options-wrapper')

        const compressionMethod = this.createBlock(
            'select',
            'compression_method',
            __('Méthode de compression', 'admin'),
            null,
            {
                description: __('Méthode de compression des images', 'admin'),
                options: compression_methods
            }
        );

        const placeholder = this.createBlock(
            'media',
            'placeholder',
            __('Image de remplacement', 'admin'),
            null,
            {
                description: __('Image de remplacement pour les images manquantes', 'admin'),
                mimeTypes: ['image/jpeg', 'image/png'],
            }
        );

        compressionMethod.render(wrapper)
        placeholder.render(wrapper)

        this.container.appendChild(wrapper)
    }
}
