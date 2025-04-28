import {OptionBlock} from './OptionBlock.js';
import Builder from '@framework/js/services/Builder';
import MediaPicker from '@framework/js/services/MediaPicker';
import {__} from '@framework/js/services/Translator';

export class MediaBlock extends OptionBlock {
    constructor(key, label, value = null, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'media';
        this.mimeTypes = options.mimeTypes || [];
        this.media = null;
        this.sizes = options.sizes || [];
        this.size = null;
        this.resized = {};
    }

    render(container) {
        const wrapper = super.render()
        wrapper.classList.add('media');

        if (this.sizes.length) {
            const select_size = Builder.select(
                'Taille',
                this.sizes,
                null,
                (size) => {
                    this.size = size;
                });
            wrapper.appendChild(select_size.getElement());
        }

        const preview = Builder.div('media-preview');

        preview.textContent = this.value?.filename || __('aucun média sélectionné', 'options');
        preview.dataset.tooltip = __('Cliquez pour changer le média', 'options');
        preview.addEventListener('click', () => {
            MediaPicker.open(this.mimeTypes, (media) => {
                this.media = media;
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

        this.reset = () => {
            preview.innerHTML = '';
            preview.textContent = __('aucun média sélectionné', 'options');
            preview.dataset.tooltip = __('Cliquez pour changer le média', 'options');
            this.value = null;
        };

        this.setValue = (value) => {
            if (typeof value !== 'object') {
                this.reset();
                return;
            }

            this.value = value;
            preview.innerHTML = '';
            preview.appendChild(this.getPreview(value));
            preview.textContent = '';
            preview.dataset.tooltip = __('Cliquez pour changer le média', 'options');
        }
    }

    getMedia() {
        return this.media;
    }

    getResizedMedia(size, responseCallback) {

        if (!this.media) {
            responseCallback(null);
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/gif'].includes(this.media.mime_type)) {
            responseCallback(null);
            return;
        }

        if (this.resized[size]) {
            responseCallback(this.resized[size]);
            return;
        }

        if (size && size !== 'original') {
            try {
                fetch(`/admin/api/medias/resize/${this.media.id}/${size}`)
                    .then(res => {
                        if (!res.ok) throw new Error('Erreur HTTP');
                        return res.json();
                    })
                    .then(data => {
                        responseCallback(data.url || url);

                    })
            } catch (e) {
                console.warn('Erreur de redimensionnement', e);
                responseCallback(null);
            }
        }
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
