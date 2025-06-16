import {OptionBlock} from './OptionBlock.js';
import Builder from '@framework/js/services/Builder.js';

export class Vector2Block extends OptionBlock {
    constructor(key, label, value = {x: 0, y: 0}, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'vector2';
        this.debounceTimer = null;
        this.delay = this.options?.delay ?? 2000;
    }

    render(container) {
        const wrapper = super.render();
        wrapper.classList.add('vector2');

        wrapper.appendChild(Builder.label(this.label));

        const progress = Builder.div('save-progress');
        wrapper.appendChild(progress);

        const vectorInput = Builder.input_vector2('', this.value, (vec) => {
            this.value = vec;

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

        wrapper.appendChild(vectorInput);
        container.appendChild(wrapper);

        this.onReset = function () {
            const inputs = wrapper.querySelectorAll('input');
            inputs[0].value = this.value.x;
            inputs[1].value = this.value.y;
        };
    }

    debounce(callback, delay) {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(callback, delay);
    }
}