import UrlPicker from '@framework/js/services/UrlPicker.js';

export default function (editor) {
    editor.DomComponents.addType('button', {
        model: {
            defaults: {
                tagName: 'a',
                name: 'Bouton',
                content: 'Clique-moi',
                editable: true,
                droppable: false,
                attributes: {
                    href: '#',
                    title: 'Clique-moi',
                    class: 'button',
                },
                blank: 'false', // Propriété interne uniquement
                traits: [
                    {
                        type: 'text',
                        name: 'href',
                        label: 'Lien',
                        changeProp: true,
                    },
                    {
                        type: 'text',
                        name: 'title',
                        label: 'Titre',
                    },
                    {
                        type: 'checkbox',
                        name: 'blank',
                        label: 'Nouvel onglet',
                        valueTrue: 'true',
                        valueFalse: 'false',
                        changeProp: true,
                    },
                    {
                        type: 'text',
                        name: 'class',
                        label: 'Classe CSS',
                    },
                    {
                        type: 'button',
                        text: 'Choisir un lien',
                        full: true,
                        command: 'open-url-picker'
                    },
                ],
            },

            init() {
                this.on('change:blank', this.updateTarget);
            },

            updateTarget() {
                const blank = this.get('blank');
                if (blank === 'true') {
                    this.addAttributes({ target: '_blank' });
                } else {
                    this.removeAttributes('target');
                }
            }
        },

        view: {
            events: {
                dblclick: 'onDoubleClick',
            },

            onDoubleClick() {
                const model = this.model;
                const attrs = model.getAttributes();

                UrlPicker.open(
                    attrs.href || '',
                    attrs.title || '',
                    model.get('blank') === 'true',
                    (url, title, blank) => {
                        model.setAttributes({
                            href: url,
                            title: title,
                        });

                        model.set('blank', blank ? 'true' : 'false');
                        model.set('href', url);

                        if (title) {
                            model.set('content', title);
                        } else {
                            model.set('content', 'Clique-moi');
                        }

                        if (blank) {
                            model.addAttributes({ target: '_blank' });
                        } else {
                            model.removeAttributes('target');
                        }
                    }
                );
            },
        },
    });

    editor.Commands.add('open-url-picker', {
        run(editor) {
            const component = editor.getSelected();
            if (component && component.get('type') === 'button') {
                component.view.onDoubleClick();
            }
        }
    });

    editor.BlockManager.add('button', {
        name: 'Bouton',
        label: 'Bouton',
        category: 'Base',
        content: {
            type: 'button',
            content: 'Clique-moi',
            attributes: {
                href: '#',
                title: 'Clique-moi',
                class: 'btn',
            },
        },
    });
}
