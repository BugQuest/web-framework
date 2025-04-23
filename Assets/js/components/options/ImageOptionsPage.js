import {OptionsPage} from './OptionsPage';
import {__} from '../Translator';
import BuildHelper from '../BuildHelper';

export class ImageOptionsPage extends OptionsPage {
    constructor() {
        super('images');
    }

    render() {
        let compression_methods = [];
        try {
            compression_methods = JSON.parse(this.container.dataset.compressionMethods);
        } catch (e) {
            console.error('Error parsing compression methods:', e);
        }

        const wrapper = BuildHelper.div('options-wrapper')

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
