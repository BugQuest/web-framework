export default function (editor) {
    editor.BlockManager.add('button', {
        label: 'Bouton',
        category: 'Base',
        content: '<button class="btn">Clique-moi</button>',
    });
}
