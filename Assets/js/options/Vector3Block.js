import {OptionBlock} from './OptionBlock.js';
import Builder from '@framework/js/services/Builder.js';

export class Vector3Block extends OptionBlock {
    constructor(key, label, value = {x: 0, y: 0, z: 0}, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'vector3';
        this.debounceTimer = null;
        this.delay = this.options?.delay ?? 2000;
    }

    render(container) {
        const wrapper = super.render();
        wrapper.classList.add('vector3');

        wrapper.appendChild(Builder.label(this.label));

        const progress = Builder.div('save-progress');
        wrapper.appendChild(progress);

        const vectorInput = Builder.input_vector3('', this.value, (vec) => {
            this.value = vec;

            // Reset animation
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

        wrapper.appendChild(vectorInput.element);
        container.appendChild(wrapper);

        this.onReset = function () {
            const inputs = wrapper.querySelectorAll('input');
            inputs[0].value = this.value.x;
            inputs[1].value = this.value.y;
            inputs[2].value = this.value.z;
        };
    }

    debounce(callback, delay) {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(callback, delay);
    }
}
