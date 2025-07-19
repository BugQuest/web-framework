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
        if (typeof value === 'object' && value !== null && "id" in value) {
            this.media = value;
            this.value = value.id;
        }
        this.sizes = options.sizes || [];
        this.size = options.size || 'original';
        this.tags = options.tags || [];
        this.compression_method = options.compression_method || 'auto';
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
                    this.updatePreview()
                });
            wrapper.appendChild(select_size.getElement());
        }

        this.preview = Builder.div('media-preview');
        this.preview.dataset.tooltip = __('Cliquez pour changer le média', 'options');
        this.preview.addEventListener('click', () => {
            MediaPicker.open({mimeTypes: this.mimeTypes, tags: this.tags}, (media) => {
                this.media = media;
                this.value = media.id;
                this.updatePreview();
            });
        });

        wrapper.appendChild(this.preview);

        // Label
        if (this.label)
            wrapper.appendChild(Builder.label(this.label));

        container.appendChild(wrapper);

        this.updatePreview(true);

        this.onReset = function (optionBlock) {
            this.reset();
        }
    }

    reset() {
        this.media = null;
        this.value = null;
        this.updatePreview(true);
    }

    setMedia(media) {
        this.media = media;
        this.value = media.id;
        this.updatePreview(true);
    }

    getMediaUrl() {
        let cache_key = `${this.media.id}-${this.size}`;
        if (this.compression_method)
            cache_key += `-${this.compression_method}`;

        return this.resized[cache_key] || this.media?.url || null;
    }

    setSize(size) {
        this.size = size;
    }

    getMedia() {
        return this.media;
    }

    getResizedMedia(responseCallback) {

        if (!this.media) {
            responseCallback(null);
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/gif'].includes(this.media.mime_type)) {
            responseCallback(null);
            return;
        }

        let cache_key = `${this.media.id}-${this.size}`;
        if (this.compression_method)
            cache_key += `-${this.compression_method}`;

        if (this.size === 'original') {
            this.resized[cache_key] = '/' + this.media.path;
            responseCallback(this.resized[cache_key]);
            return;
        }

        if (this.resized[cache_key]) {
            responseCallback(this.resized[cache_key]);
            return;
        }

        if (this.size && this.size !== 'original') {
            try {
                fetch(`/admin/api/medias/resize/${this.media.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        compression_method: this.compression_method,
                        size: this.size,
                    })
                })
                    .then(res => {
                        if (!res.ok) throw new Error('Erreur HTTP');
                        return res.json();
                    })
                    .then(data => {
                        this.resized[cache_key] = data.url || '/' + this.media.path;
                        responseCallback(this.resized[cache_key]);

                    })
            } catch (e) {
                console.warn('Erreur de redimensionnement', e);
                responseCallback(null);
            }
        }
    }

    updatePreview(init = false) {
        this.preview.innerHTML = '';

        this.preview.textContent = this.media?.filename || __('aucun média sélectionné', 'options');

        if (!this.media) {
            if (!init) this.notifyChange();
            return;
        }

        let className = 'media-current';

        switch (this.media?.mime_type) {
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
        if (['image/jpeg', 'image/jpg', 'image/png'].includes(this.media?.mime_type)) {
            this.getResizedMedia((url) => {
                this.preview.appendChild(Builder.img(url, this.media.filename, className));
                if (!init) this.notifyChange();
            })
        } else if (['image/svg+xml', 'image/svg'].includes(this.media?.mime_type)) {
            this.preview.appendChild(Builder.img('/' + this.media.path, this.media.filename, className));
            if (!init) this.notifyChange();
        } else {
            const icon = this.getIconForMime(this.media.mime_type);
            let span = Builder.span(className);
            span.textContent = icon;
            this.preview.appendChild(span);
            if (!init) this.notifyChange();
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
