export default function (editor) {
    editor.DomComponents.addType('paragraph', {
        extend: 'text',
        model: {
            defaults: {
                tagName: 'p',
                name: 'Paragraphe',
                content: 'Voici un paragraphe de texte...',
                editable: true,
                droppable: false,
                traits: [],
            },
        },
    });

    editor.BlockManager.add('paragraph', {
        label: 'Paragraphe',
        category: 'Base',
        content: {
            type: 'paragraph',
        },
    });
}
