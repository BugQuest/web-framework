export default function (editor) {
    editor.BlockManager.add('three-column', {
        label: '3 Colonnes',
        category: 'Structure',
        content: {
            tagName: 'div',
            classes: ['three-column'],
            name: 'Trois Colonnes',
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
                {
                    tagName: 'div',
                    classes: ['column'],
                    name: 'Colonne 3',
                    droppable: true,
                    removable: false,
                    draggable: false,
                    copyable: false,
                },
            ],
        },
    });
}