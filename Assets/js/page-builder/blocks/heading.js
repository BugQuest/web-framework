export default function (editor) {
    editor.DomComponents.addType('heading', {
        model: {
            defaults: {
                name: 'Titre',
                tagName: 'h1',
                content: 'Titre par défaut',
                editable: false, // 👈 false ici, on gère manuellement
                droppable: false,
                stylable: true,
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
                    },
                    {
                        type: 'select',
                        label: 'Alignement',
                        name: 'align',
                        options: [
                            {value: '', name: 'Par défaut'},
                            {value: 'left', name: 'Gauche'},
                            {value: 'center', name: 'Centre'},
                            {value: 'right', name: 'Droite'},
                            {value: 'justify', name: 'Justifié'},
                        ],
                        changeProp: 1,
                    },
                ],
                level: 'h1',
                align: '',
                components: null, // 👈 important
            },

            init() {
                this.listenTo(this, 'change:level', this.handleLevelChange);
                this.listenTo(this, 'change:align', this.handleAlignChange);
            },

            handleLevelChange() {
                const level = this.get('level');
                this.set('tagName', level);
            },

            handleAlignChange() {
                const align = this.get('align');
                const style = this.getStyle() || {};
                if (align)
                    style['text-align'] = align;
                else
                    delete style['text-align'];
                this.setStyle(style);
            },
        },

        view: {
            events: {
                dblclick: 'enableEditing',
                focusout: 'disableEditing',
            },

            enableEditing() {
                this.el.setAttribute('contenteditable', 'true');
                this.el.focus();
            },

            disableEditing() {
                this.el.removeAttribute('contenteditable');
                const content = this.el.innerHTML;
                this.model.set('content', content);
            },
        },
    });

    editor.BlockManager.add('heading', {
        label: 'Titre',
        category: 'Base',
        content: {
            type: 'heading',
            content: 'Titre par défaut',
            level: 'h1',
            align: '',
        }
    });
}
