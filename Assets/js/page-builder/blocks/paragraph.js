export default function (editor) {
    editor.BlockManager.add('paragraph', {
        name: 'Paragraphe',
        label: 'Paragraphe',
        category: 'Base',
        content: '<p>Voici un paragraphe de texte...</p>',
    });
}
