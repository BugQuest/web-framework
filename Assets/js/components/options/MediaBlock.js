import {OptionBlock} from './OptionBlock.js';
import BuildHelper from '../BuildHelper.js';
import MediaGallery from '../MediaGallery';

export class MediaBlock extends OptionBlock {
    constructor(key, label, value = null, options = [], onChange = null) {
        super(key, label, value, onChange);
        this.options = options; // tableau d'objets { value: string, label: string }
    }

    render(container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'option-block media';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.value = this.value ?? '';
        input.name = this.key;
        wrapper.appendChild(input);

        const preview = document.createElement('div');
        preview.className = 'media-preview';
        preview.textContent = this.value || 'Aucun média sélectionné';
        preview.dataset.tooltip = 'Sélectionner un média';
        preview.addEventListener('click', () => {
            this.modal.classList.add('active');
            // 👉 ici, déclenche ton sélecteur personnalisé et set la valeur
        });

        const label = document.createElement('label');
        label.textContent = this.label;

        wrapper.appendChild(preview);
        wrapper.appendChild(label);
        container.appendChild(wrapper);

        const {modal, content, close} = BuildHelper.modal(null, () => {
        });
        content.dataset.canUpload = 'true';

        this.modal = modal;
        document.body.appendChild(this.modal);

        this.gallery = new MediaGallery(content);
        this.gallery.onClickItem = (media) => {
            input.value = media.id;
            preview.appendChild(this.getPreview(media));
            this.modal.classList.remove('active');
            this.onChange(media.id);
        };
    }

    getPreview(media) {
        //return img if media is an image, else return icon (media.mime_type)
        if (media.mime_type.startsWith('image/')) {
            return BuildHelper.img('/' + media.path, media.name, 'media-current');
        } else {
            const icon = this.gallery.getIconForMime(media.mime_type);
            let span = document.createElement('span');
            span.className = 'media-current';
            span.textContent = icon;

            return span;
        }


    }
}
