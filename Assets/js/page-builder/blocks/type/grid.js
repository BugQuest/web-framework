export default function (editor) {
    editor.DomComponents.addType('grid', {
        model: {
            defaults: {
                name: 'Grille',
                classes: ['grid'],
                droppable: true,
                draggable: true,
                removable: true,
                copyable: true,
                components: [
                    {
                        type: 'cell',
                    },
                    {
                        type: 'cell',
                    },
                ],
                toolbar: [
                    {command: 'add-cell', label: '➕'},
                    {command: 'remove-cell', label: '➖'},
                ],
            },
        },
    });

    editor.DomComponents.addType('cell', {
        model: {
            defaults: {
                name: 'Cellule',
                classes: ['cell'],
                droppable: true,
                removable: true,
                draggable: true,
                copyable: true,
            },
        },
    });

    editor.Commands.add('add-cell', {
        run(editor, sender, options = {}) {
            const selected = editor.getSelected();
            if (selected?.get('type') === 'grid') {
                selected.append({type: 'cell'});
            }
        },
    });

    editor.Commands.add('remove-cell', {
        run(editor, sender, options = {}) {
            const selected = editor.getSelected();
            if (selected?.get('type') === 'grid') {
                const cells = selected.components().filter(c => c.get('type') === 'cell');
                if (cells.length > 0) {
                    cells[cells.length - 1].remove();
                }
            }
        },
    });
}