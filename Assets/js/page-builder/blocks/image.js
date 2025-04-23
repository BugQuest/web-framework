export default function (editor) {
    editor.BlockManager.add('custom-image', {
        name: 'Image',
        label: 'Image',
        category: 'Base',
        content: {
            type: 'custom-image'
        }
    });
}
