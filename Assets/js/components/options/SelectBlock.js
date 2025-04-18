import {OptionBlock} from './OptionBlock.js';

export class SelectBlock extends OptionBlock {
    constructor(key, label, value = null, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'string';
    }

    render(container) {
        const wrapper = super.render()
        wrapper.classList.add('select')

        const labelEl = document.createElement('label');
        labelEl.textContent = this.label;
        labelEl.setAttribute('for', this.key);

        const select = document.createElement('select');
        select.id = this.key;
        select.name = this.key;

        this.options?.options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            option.selected = opt.value === this.value;
            select.appendChild(option);
        });

        select.addEventListener('change', () => {
            this.value = select.value;
            this.notifyChange();
        });

        wrapper.appendChild(labelEl);
        wrapper.appendChild(select);

        container.appendChild(wrapper);
    }
}
