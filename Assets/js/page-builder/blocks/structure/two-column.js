export default function (editor) {
    editor.BlockManager.add('two-column', {
        label: '2 Colonnes',
        category: 'Structure',
        content: {
            tagName: 'div',
            classes: ['two-column'],
            name: 'Deux Colonnes',
            droppable: true,
            components: [
                {
                    tagName: 'div',
                    classes: ['column'],
                    name: 'Colonne 1',
                    droppable: true,
                    removable: false,
                    draggable: false,
                    copyable: false,
                },
                {
                    tagName: 'div',
                    classes: ['column'],
                    name: 'Colonne 2',
                    droppable: true,
                    removable: false,
                    draggable: false,
                    copyable: false,
                },
            ],
        },
    });
}