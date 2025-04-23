export default function (editor) {
    const domc = editor.DomComponents;
    const blockManager = editor.BlockManager;

    domc.addType('custom-image', {
        model: {
            defaults: {
                tagName: 'img',
                attributes: {
                    src: 'https://via.placeholder.com/350x150',
                    alt: 'Image',
                },
                traits: [
                    'alt',
                    {
                        type: 'media-selector',
                        name: 'src',
                        label: 'Image',
                    }
                ],
                draggable: true,
                droppable: false,
            },
        }
    });

    blockManager.add('custom-image', {
        label: 'Image',
        category: 'Base',
        content: {
            type: 'custom-image'
        }
    });
}
