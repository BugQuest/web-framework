import {OptionBlock} from './OptionBlock.js';
import Builder from '@framework/js/services/Builder.js';
import Select from '@framework/js/services/Select.js';

export class SelectBlock extends OptionBlock {
    constructor(key, label, value = null, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'string';
        this.useSearch = options?.useSearch || false;
        this.isMultiple = options?.isMultiple || false;
        this.placeholder = options?.placeholder || 'Sélectionner…';
        if(this.isMultiple)
            this.type = 'array';
    }

    render(container) {
        const wrapper = super.render()
        wrapper.classList.add('select')

        const label_el = Builder.label(this.label);
        label_el.setAttribute('for', this.key);

        const select = new Select({
            label: this.label,
            options: this.options?.options || [],
            selected: this.value || (this.isMultiple ? [] : null),
            onChange: (value) => {
                this.value = value;
                this.notifyChange();
            },
            multiple: this.isMultiple,
            placeholder: this.placeholder,
            bottom: true,
            useSearch: this.useSearch,
        });

        wrapper.appendChild(label_el);
        wrapper.appendChild(select.getElement());

        container.appendChild(wrapper);

        this.onReset = function (optionBlock) {
            select.setValue(this.value);
        }
    }
}
