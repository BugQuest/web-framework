export default function (editor) {
    editor.DomComponents.addType('heading', {
        model: {
            defaults: {
                tagName: 'h1',
                traits: [
                    {
                        type: 'select',
                        label: 'Niveau',
                        name: 'level',
                        options: [
                            {value: 'h1', name: 'H1'},
                            {value: 'h2', name: 'H2'},
                            {value: 'h3', name: 'H3'},
                            {value: 'h4', name: 'H4'},
                            {value: 'h5', name: 'H5'},
                            {value: 'h6', name: 'H6'},
                        ],
                        changeProp: 1,
                    }
                ],
                level: 'h1', // valeur par défaut
            },

            init() {
                this.listenTo(this, 'change:level', this.handleLevelChange);
            },

            handleLevelChange() {
                const level = this.get('level');
                this.set({tagName: level});
            }
        }
    });
}