import heading from './heading.js';
import paragraph from './paragraph.js';
import image from './image.js';
import button from './button.js';
import container from './container.js';
import BuildHelper from '@framework/js/components/BuildHelper';
import MediaGallery from '@framework/js/components/MediaGallery';

let sharedMediaModal = null;
let sharedGallery = null;
let availableSizes = null;


export default function loadBasicBlocks(editor) {

    editor.TraitManager.addType('media-selector', {
        createInput({trait}) {
            const el = document.createElement('div');
            el.classList.add('gjs-field', 'gjs-field-media');

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = 'Choisir une image';
            btn.className = 'gjs-btn-media';

            const preview = document.createElement('div');
            preview.className = 'gjs-media-preview';

            const sizeSelect = document.createElement('select');
            sizeSelect.className = 'gjs-media-size';
            sizeSelect.disabled = true;

            // ⚠️ On ne retourne rien tant que ce n'est pas synchrone
            fetchSizes().then(sizes => {
                Object.entries(sizes).forEach(([key, val]) => {
                    const opt = document.createElement('option');
                    opt.value = key;
                    opt.textContent = `${key} (${val.width}x${val.height}${val.crop ? ' crop' : ''})`;
                    sizeSelect.appendChild(opt);
                });
                sizeSelect.disabled = false;
            });

            // Valeur actuelle
            const current = trait.target?.getAttributes()[trait.name];
            if (current) {
                preview.appendChild(BuildHelper.img(current, 'Aperçu', 'media-current'));
            }

            btn.addEventListener('click', () => {
                if (!sharedMediaModal) {
                    const {modal, content, close} = BuildHelper.modal(null, () => modal.remove());
                    content.dataset.canUpload = 'true';
                    content.dataset.forcedMimeTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'];

                    sharedMediaModal = modal;
                    document.body.appendChild(sharedMediaModal);
                    sharedGallery = new MediaGallery(content);
                }

                sharedGallery.onClickItem = async (media) => {
                    const selectedSize = sizeSelect.value || 'original';
                    let resizedUrl = '/' + media.path;

                    if (selectedSize && selectedSize !== 'original') {
                        try {
                            const res = await fetch(`/admin/api/medias/resize/${media.id}/${selectedSize}`);
                            const data = await res.json();
                            resizedUrl = data.url || resizedUrl;
                        } catch (e) {
                            console.warn('Erreur de redimensionnement', e);
                        }
                    }

                    // Mettre à jour l'attribut data-size
                    trait.target.setAttributes({
                        'data-size': selectedSize,
                        'data-media': media.id
                    });

                    trait.setTargetValue(resizedUrl);
                    preview.innerHTML = '';
                    preview.appendChild(BuildHelper.img(resizedUrl, media.name, 'media-current'));
                    sharedMediaModal.classList.remove('active');
                };

                sharedMediaModal.classList.add('active');
                sharedGallery.loadPage()
            });

            sizeSelect.addEventListener('change', async () => {
                const currentSrc = trait.target?.getAttributes()['src'];
                const mediaId = trait.target?.getAttributes()['data-media'];
                console.log("currentSrc", currentSrc, 'mediaId', mediaId);

                if (!mediaId || !currentSrc) return;

                const selectedSize = sizeSelect.value;

                try {
                    const res = await fetch(`/admin/api/medias/resize/${mediaId}/${selectedSize}`);
                    const data = await res.json();
                    const resizedUrl = data.url || currentSrc;

                    // Mettre à jour l'attribut data-size
                    trait.target.setAttributes({
                        'data-size': selectedSize,
                        'data-media': mediaId
                    });

                    trait.setTargetValue(resizedUrl);
                    preview.innerHTML = '';
                    preview.appendChild(BuildHelper.img(resizedUrl, 'Aperçu', 'media-current'));
                } catch (e) {
                    console.error('Erreur de redimensionnement', e);
                }
            });

            el.appendChild(btn);
            el.appendChild(sizeSelect);
            el.appendChild(preview);

            sizeSelect.disabled = false;
            return el;
        },

        onEvent({elInput, component, trait}) {
            // géré dynamiquement
        }
    });

    heading(editor);
    paragraph(editor);
    image(editor);
    button(editor);
    container(editor);
}

async function fetchSizes() {
    if (availableSizes) return availableSizes;

    try {
        const response = await fetch('/admin/api/medias/sizes');
        if (!response.ok) throw new Error('Erreur HTTP');
        availableSizes = await response.json();
    } catch (e) {
        console.error('Erreur lors du chargement des tailles', e);
        availableSizes = {};
    }

    return availableSizes;
}