import {OptionBlock} from './OptionBlock.js';
import Builder from '@framework/js/services/Builder.js';

export class SelectMultipleBlock extends OptionBlock {
    constructor(key, label, value = [], options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'array';
    }

    render(container) {
        const wrapper = super.render();
        wrapper.classList.add('select', 'select-multiple');

        const label_el = Builder.label(this.label);
        label_el.setAttribute('for', this.key);

        const select = Builder.selectMultiple(
            this.label,
            this.options?.options || [],
            this.value || [],
            (values) => {
                this.value = values;
                this.notifyChange();
            }
        );

        wrapper.appendChild(label_el);
        wrapper.appendChild(select.element);

        container.appendChild(wrapper);
    }
}
