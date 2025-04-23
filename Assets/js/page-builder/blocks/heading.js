export default function (editor) {
    //heading block with choice of h1, h2, h3, h4, h5, h6
    editor.BlockManager.add('heading', {
        label: 'Titre',
        category: 'Base',
        content: {
            type: 'heading',
            content: 'Titre',
            level: 'h1',
        }
    });
}
