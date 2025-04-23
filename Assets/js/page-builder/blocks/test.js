export default function (editor) {
    editor.DomComponents.addType('heading', {
        model: {
            defaults: {
                tagName: 'h1',
                name: 'Titre',
                editable: true,
                droppable: false,
                traits: [
                    {
                        type: 'select',
                        name: 'tagName',
                        label: 'Niveau',
                        options: [
                            { value: 'h1', name: 'H1' },
                            { value: 'h2', name: 'H2' },
                            { value: 'h3', name: 'H3' },
                            { value: 'h4', name: 'H4' },
                            { value: 'h5', name: 'H5' },
                            { value: 'h6', name: 'H6' },
                        ],
                    },
                ],
                content: 'Titre par défaut',
            },
        },
    });
}