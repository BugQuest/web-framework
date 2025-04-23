import {OptionBlock} from './OptionBlock.js';
import Builder from '@framework/js/services/Builder.js';

export class StringBlock extends OptionBlock {
    constructor(key, label, value = null, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'string';
        this.debounceTimer = null;
        this.delay = this.options?.delay ?? 2000;
        this.placeholder = this.options?.placeholder ?? '';
        this.isPassword = this.options?.isPassword ?? false;
    }

    render(container) {
        const wrapper = super.render();
        wrapper.classList.add('string');

        wrapper.appendChild(Builder.label(this.label));

        const input = Builder.input_text(this.placeholder, this.value);
        input.type = this.isPassword ? 'password' : 'text';
        wrapper.appendChild(input);

        // Barre de progression
        const progress = Builder.div('save-progress');
        wrapper.appendChild(progress);

        input.addEventListener('input', (e) => {
            this.value = e.target.value;

            // Reset animation de la barre
            progress.style.transition = 'none';
            progress.style.width = '0';

            // Lancer animation
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
        console.log('Debouncing...');
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(callback, delay);
    }
}
