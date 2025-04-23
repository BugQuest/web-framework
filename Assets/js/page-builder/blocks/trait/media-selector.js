import Builder from '@framework/js/services/Builder.js';
import MediaPicker from '@framework/js/services/MediaPicker.js';


export default function (editor) {
    editor.TraitManager.addType('media-selector', {
        availableSizes: [],
        preview: null,
        createInput({trait}) {
            const el = Builder.div('gjs-field', 'gjs-field-media');

            this.fetchSizes().then(() => {
                this.buildElements(trait, el);
            });

            return el;
        },

        buildElements(trait, el) {
            this.preview = Builder.div('gjs-media-preview');
            const clickOnMe = Builder.div('click-on-me');
            clickOnMe.textContent = 'Choisir une image';

            const currentSrc = trait.target?.getAttributes()['src'];
            if (currentSrc)
                this.preview.appendChild(Builder.img(currentSrc, 'Aperçu', 'media-current'));

            this.preview.appendChild(clickOnMe);
            let mimeType = [];
            try {
                mimeType = JSON.parse(trait.target?.getAttributes()['data-mimes']);
            } catch (e) {

            }

            const current = trait.target?.getAttributes()[trait.name];
            if (current)
                this.preview.appendChild(Builder.img(current, 'Aperçu', 'media-current'));

            el.appendChild(
                Builder.select(
                    this.availableSizes,
                    null,
                    'gjs-media-sizes',
                    async (value) => {
                        await this.onSizeChange(value, trait);
                    })
            );

            el.appendChild(this.preview);

            this.preview.addEventListener('click', () => {
                MediaPicker.open(mimeType, (media) => {
                    const resizedUrl = '/' + media.path;
                    const mediaId = media.id;
                    const size = trait.target?.getAttributes()['data-size'] || 'original';
                    this.resize(resizedUrl, mediaId, size, trait)
                });
            });
        },

        setPreview(url) {
            this.preview.innerHTML = '';
            this.preview.appendChild(Builder.img(url, 'preview', 'media-current'));
        },

        resize(url, mediaId, size, trait) {
            let resizedUrl = url;

            if (size && size !== 'original') {
                try {
                    fetch(`/admin/api/medias/resize/${mediaId}/${size}`)
                        .then(res => {
                            if (!res.ok) throw new Error('Erreur HTTP');
                            return res.json();
                        }).then(data => {
                        resizedUrl = data.url || resizedUrl;

                        trait.target.setAttributes({
                            'src': resizedUrl,
                            'data-size': size,
                            'data-media': mediaId
                        });

                        this.setPreview(resizedUrl);
                    })

                } catch (e) {
                    console.warn('Erreur de redimensionnement', e);
                }
            }
        },

        async fetchSizes() {
            if (this.availableSizes.length) return this.availableSizes;

            try {
                const response = await fetch('/admin/api/medias/sizes');
                if (!response.ok) throw new Error('Erreur HTTP');
                const sizes = await response.json();
                Object.entries(sizes).forEach(([key, val]) => {
                    this.availableSizes.push({
                        label: `${key} (${val.width}x${val.height}${val.crop ? ' crop' : ''})`,
                        value: key
                    });
                });
            } catch (e) {
                console.error('Erreur lors du chargement des tailles', e);
                this.availableSizes = [];
            }
        },

        async onSizeChange(size, trait) {
            const currentSrc = trait.target?.getAttributes()['src'];
            const mediaId = trait.target?.getAttributes()['data-media'];

            if (!mediaId || !currentSrc) return;

            this.resize(currentSrc, mediaId, size, trait, this.preview);
        },

        onEvent({elInput, component, trait}) {
            // géré dynamiquement

        }
    });
}