export default function (editor) {
    editor.BlockManager.add('heading', {
        label: 'Titre',
        category: 'Base',
        content: '<h1>Titre</h1>',
    });
}
