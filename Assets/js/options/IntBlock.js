import {OptionBlock} from './OptionBlock.js';
import Builder from '@framework/js/services/Builder.js';

export class IntBlock extends OptionBlock {
    constructor(key, label, value = null, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'int';
        this.debounceTimer = null;
        this.delay = this.options?.delay ?? 2000;
        this.placeholder = this.options?.placeholder ?? '';
    }

    render(container) {
        const wrapper = super.render();
        wrapper.classList.add('int');

        wrapper.appendChild(Builder.label(this.label))

        const input = Builder.input_number(this.placeholder, 1, this.value);
        wrapper.appendChild(input);

        const progress = Builder.div('save-progress');
        wrapper.appendChild(progress);

        input.addEventListener('input', (e) => {
            this.value = parseInt(e.target.value)

            // Réinitialiser progress
            progress.style.transition = 'none';
            progress.style.width = '0';

            requestAnimationFrame(() => {
                progress.style.transition = `width ${this.delay}ms linear`;
                progress.style.width = '100%';
            });

            this.debounce(() => {
                this.notifyChange();
                progress.style.transition = 'none';
                progress.style.width = '0';
            }, this.delay);
        });

        container.appendChild(wrapper);
    }

    debounce(callback, delay) {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(callback, delay);
    }
}