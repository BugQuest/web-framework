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

        const switcher = Builder.div('bool-switch');
        switcher.dataset.state = this.value ? 'on' : 'off';
        switcher.title = this.value ? __('Activé', 'options') : __('Désactivé', 'options');
        switcher.addEventListener('click', () => {
            this.value = !this.value;
            switcher.dataset.state = this.value ? 'on' : 'off';
            switcher.title = this.value ? __('Activé', 'options') : __('Désactivé', 'options');
            this.notifyChange();
        });

        wrapper.appendChild(switcher);
        container.appendChild(wrapper);
    }
}
