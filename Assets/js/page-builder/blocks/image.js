import MediaPicker from '@framework/js/services/MediaPicker.js';

export default function (editor) {

    editor.DomComponents.addType('custom-image', {
        model: {
            defaults: {
                tagName: 'img',
                name: 'Image',
                traits: [
                    {
                        type: 'media-selector',
                        label: 'Image',
                        name: 'src',
                        changeProp: 1,
                    }
                ],
                src: '',
                components: null,
                draggable: true,
                droppable: false,
            }
        },

        view: {
            events: {
                dblclick: 'onDoubleClick',
            },

            onDoubleClick() {
                const component = this.model;
                const attributes = component.getAttributes();
                const mimes = attributes['data-mimes'];
                const size = attributes['data-size'] || 'original';
                let mimeArray = [];

                try {
                    mimeArray = JSON.parse(mimes);
                } catch (e) {
                    mimeArray = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
                }

                // Appel de MediaPicker
                MediaPicker.open(mimeArray, async (media) => {
                    let resizedUrl = '/' + media.path;

                    if (size && size !== 'original') {
                        try {
                            const res = await fetch(`/admin/api/medias/resize/${media.id}/${size}`);
                            const data = await res.json();
                            resizedUrl = data.url || resizedUrl;
                        } catch (e) {
                            console.warn('Erreur de redimensionnement', e);
                        }
                    }

                    component.setAttributes({
                        src: resizedUrl,
                        'data-size': size,
                        'data-media': media.id,
                    });

                    // Mettre à jour l'aperçu
                    const trait = component.getTrait('src');
                    if (trait && trait.view && typeof trait.view.setPreview === 'function')
                        trait.view.setPreview(resizedUrl);
                });
            }
        }
    });


    editor.BlockManager.add('custom-image', {
        name: 'Image',
        label: 'Image',
        category: 'Base',
        content: {
            type: 'custom-image',
            attributes: {
                'data-mimes': JSON.stringify(['image/jpeg', 'image/jpg', 'image/png', 'image/gif']),
            }
        }
    });
}
