import {OptionBlock} from './OptionBlock.js';

export class SelectBlock extends OptionBlock {
    constructor(key, label, value = null, options = [], onChange = null) {
        super(key, label, value, onChange);
        this.options = options; // tableau d'objets { value: string, label: string }
    }

    render(container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'option-block select';

        const labelEl = document.createElement('label');
        labelEl.textContent = this.label;
        labelEl.setAttribute('for', this.key);

        const select = document.createElement('select');
        select.id = this.key;
        select.name = this.key;

        this.options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            if (opt.value === this.value) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.addEventListener('change', () => {
            this.setValue(select.value);
            this.notifyChange();
        });

        wrapper.appendChild(labelEl);
        wrapper.appendChild(select);

        container.appendChild(wrapper);
    }
}
