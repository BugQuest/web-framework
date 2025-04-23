import {OptionBlock} from './OptionBlock.js';
import Builder from '@framework/js/services/Builder.js';

export class SelectBlock extends OptionBlock {
    constructor(key, label, value = null, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'string';
    }

    render(container) {
        const wrapper = super.render()
        wrapper.classList.add('select')

        const label_el = Builder.label(this.label);
        label_el.setAttribute('for', this.key);

        const select = Builder.select(this.options?.options || [], this.value, (value) => {
            this.value = value;
            this.notifyChange();
        });
        select.id = this.key;
        select.name = this.key;

        select.addEventListener('change', () => {
            this.value = select.value;
            this.notifyChange();
        });

        wrapper.appendChild(label_el);
        wrapper.appendChild(select);

        container.appendChild(wrapper);
    }
}
