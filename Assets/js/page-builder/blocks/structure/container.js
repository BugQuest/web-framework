export default function (editor) {
    editor.BlockManager.add('container', {
        label: 'Conteneur',
        category: 'Structure',
        content: {
            name: 'Conteneur',
            tagName: 'div',
            classes: ['container'],
            components: [],
            droppable: true,
        }
    });
}
