export default function (editor) {
    editor.BlockManager.add('custom-image', {
        label: 'Image',
        category: 'Base',
        content: {
            type: 'custom-image'
        }
    });
}
