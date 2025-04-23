export default function (editor) {
    editor.BlockManager.add('paragraph', {
        label: 'Paragraphe',
        category: 'Base',
        content: '<p>Voici un paragraphe de texte...</p>',
    });
}
