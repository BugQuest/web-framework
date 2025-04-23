import {OptionBlock} from './OptionBlock.js';
import Builder from '@framework/js/services/Builder.js';
import Quill from 'quill';

export class WysiwygBlock extends OptionBlock {
    constructor(key, label, value = '', options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'wysiwyg';
        this.placeholder = this.options?.placeholder ?? 'Commence à écrire...';
        this.theme = this.options?.theme ?? 'snow'; // snow ou bubble
        this.toolbar = this.options?.toolbar ?? [
            ['bold', 'italic', 'underline', 'strike'],
            [{'list': 'bullet'}, {'list': 'ordered'}],
            ['link', 'clean'],
            [{'header': [1, 2, 3, false]}],
            [{'color': []}, {'background': []}],
            [{'align': []}],
        ];
    }

    render(container) {
        const wrapper = super.render();
        wrapper.classList.add('wysiwyg');

        // Label
        wrapper.appendChild(Builder.label(this.label));

        // Zone pour l'éditeur
        const editorEl = Builder.div('quill-editor');
        wrapper.appendChild(editorEl);

        // Init Quill
        const quill = new Quill(editorEl, {
            theme: this.theme,
            placeholder: this.placeholder,
            modules: {
                toolbar: this.toolbar
            }
        });

        // Initialisation de la valeur
        quill.root.innerHTML = this.value;

        // Bouton Save
        const saveBtn = Builder.button('Save', 'save-button');
        wrapper.appendChild(saveBtn);

        // Sauvegarde manuelle
        saveBtn.addEventListener('click', () => {
            this.value = quill.root.innerHTML;
            this.notifyChange();
            saveBtn.classList.add('saved');
            setTimeout(() => saveBtn.classList.remove('saved'), 1000);
        });

        container.appendChild(wrapper);
    }
}
