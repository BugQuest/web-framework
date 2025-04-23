export default function (editor) {
    editor.BlockManager.add('grid', {
        label: 'Grille responsive',
        category: 'Structure',
        content: {
            type: 'grid',
        },
    });
}