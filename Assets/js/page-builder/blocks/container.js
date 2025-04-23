export default function (editor) {
    editor.BlockManager.add('container', {
        label: 'Conteneur',
        category: 'Structure',
        content: '<div class="container">Contenu ici</div>',
    });
}
