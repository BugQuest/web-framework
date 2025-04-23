import {OptionBlock} from './OptionBlock.js';
import Builder from '@framework/js/services/Builder.js';
import {__} from '@framework/js/services/Translator.js';

export class BoolBlock extends OptionBlock {
    constructor(key, label, value = false, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'bool';
    }

    render(container) {
        const wrapper = super.render();
        wrapper.classList.add('bool');

        wrapper.appendChild(Builder.label(this.label));

        const switcher = Builder.switch(
            this.value,
            (value) => {
                this.value = value;
                this.notifyChange();
            });

        wrapper.appendChild(switcher.element);
        container.appendChild(wrapper);
    }
}
