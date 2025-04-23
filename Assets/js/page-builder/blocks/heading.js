export default function (editor) {
    editor.BlockManager.add('heading', {
        label: 'Titre',
        category: 'Base',
        content: {
            type: 'heading',
            content: 'Titre par défaut',
            level: 'h1',
            align: '',
        }
    });
}
