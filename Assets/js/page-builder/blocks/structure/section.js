export default function (editor) {
    editor.BlockManager.add('section', {
        label: 'Section',
        category: 'Structure',
        content: {
            name: 'Section',
            tagName: 'section',
            classes: ['section'],
            components: [],
            droppable: true,
        },
    });
}
