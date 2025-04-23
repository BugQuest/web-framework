import {OptionBlock} from './OptionBlock.js';
import Builder from '@framework/js/services/Builder';
import MediaPicker from '@framework/js/services/MediaPicker';
import {__} from '@framework/js/services/Translator';

export class MediaBlock extends OptionBlock {
    constructor(key, label, value = null, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'media';
        this.mimeTypes = options.mimeTypes || [];
    }

    render(container) {
        const wrapper = super.render()
        wrapper.classList.add('media');

        const preview = Builder.div('media-preview');

        preview.textContent = this.value?.filename || __('aucun média sélectionné', 'options');
        preview.dataset.tooltip = __('Cliquez pour changer le média', 'options');
        preview.addEventListener('click', () => {
            MediaPicker.open(this.mimeTypes, (media) => {
                this.value = media.id;
                preview.innerHTML = '';
                preview.appendChild(this.getPreview(media));
                this.notifyChange();
            });
        });

        if (this.value) {
            preview.appendChild(this.getPreview(this.value));
            this.value = this.value.id;
        }

        wrapper.appendChild(preview);

        // Label
        if (this.label)
            wrapper.appendChild(Builder.label(this.label));

        container.appendChild(wrapper);
    }

    getPreview(media) {
        let className = 'media-current';

        switch (media?.mime_type) {
            case 'image/gif':
                className += ' gif';
                break;
            case 'image/svg+xml':
            case 'image/svg':
                className += ' svg';
                break;
            case 'image/jpeg':
            case 'image/jpg':
            case 'image/png':
                className += ' image';
                break;
            default:
                className += ' icon';
        }

        //return img if media is an image, else return icon (media.mime_type)
        if (media?.mime_type?.startsWith('image/')) {
            return Builder.img('/' + media.path, media.filename, className);
        } else {
            const icon = this.getIconForMime(media.mime_type);
            let span = Builder.span(className);
            span.textContent = icon;
            return span;
        }
    }

    getIconForMime(mime) {
        if (!mime) return '?';
        if (mime === 'application/pdf') return '📄';
        if (mime === 'text/plain') return '📃';
        if (mime.startsWith('video/')) return '🎥';
        if (mime.startsWith('audio/')) return '🎵';
        return '📁';
    }
}
