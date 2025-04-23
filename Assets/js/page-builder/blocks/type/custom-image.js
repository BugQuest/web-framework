export default function (editor) {
    editor.DomComponents.addType('custom-image', {
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
}