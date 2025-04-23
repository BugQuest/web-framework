export default function (editor) {
    editor.BlockManager.add('button', {
        name: 'Bouton',
        label: 'Bouton',
        category: 'Base',
        content: '<button class="btn">Clique-moi</button>',
    });
}
