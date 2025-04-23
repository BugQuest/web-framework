export default function (editor) {
    editor.BlockManager.add('wrapper', {
        label: 'wrapper',
        category: 'Structure',
        content: {
            name: 'Wrapper',
            tagName: 'div',
            classes: ['wrapper'],
            components: [],
            droppable: true // 👈 important
        }
    });
}
