import { OptionBlock } from './OptionBlock.js';
import Builder from '@framework/js/services/Builder.js';

export class TextareaBlock extends OptionBlock {
    constructor(key, label, value = null, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'textarea';
        this.placeholder = this.options?.placeholder ?? '';
    }

    render(container) {
        const wrapper = super.render();
        wrapper.classList.add('textarea');

        // Label
        wrapper.appendChild(Builder.label(this.label));

        // Textarea
        const textarea = Builder.textarea(this.placeholder, this.value);
        wrapper.appendChild(textarea);

        // Bouton Save
        const saveBtn = Builder.button('Save', 'save-button');
        wrapper.appendChild(saveBtn);

        // Sauvegarde manuelle
        saveBtn.addEventListener('click', () => {
            this.value = textarea.value;
            this.notifyChange();
            saveBtn.classList.add('saved');

            // Feedback visuel temporaire
            setTimeout(() => saveBtn.classList.remove('saved'), 1000);
        });

        container.appendChild(wrapper);
    }
}
