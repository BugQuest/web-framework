export default function (editor) {
    editor.BlockManager.add('container', {
        label: 'Conteneur',
        category: 'Structure',
        content: {
            tagName: 'div',
            classes: ['container'],
            components: [],
            droppable: true // 👈 important
        }
    });
}
