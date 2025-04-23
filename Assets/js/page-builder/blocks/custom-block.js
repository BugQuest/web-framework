export default function (editor) {
    const domc = editor.DomComponents;
    const blockManager = editor.BlockManager;

    domc.addType('custom-block', {
        isComponent(el) {
            return el.hasAttribute && el.hasAttribute('data-block-type');
        },
        model: {
            defaults: {
                droppable: false,
                stylable: true,
                traits: [
                    {
                        type: 'text',
                        name: 'block-data',
                        label: 'Données',
                        placeholder: 'JSON des données',
                    },
                ],
                'custom-data': {},
            },

            init() {
                // ⚠️ tu peux synchroniser ici les props internes
            },
        },
        view: {
            onRender() {
                const type = this.model.getAttributes()['data-block-type'];
                const data = this.model.get('custom-data');
                this.el.innerHTML = `<div style="opacity:.7">[Bloc ${type}]</div>`;
            }
        }
    });
}
