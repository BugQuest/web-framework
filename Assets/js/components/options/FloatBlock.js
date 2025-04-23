import { OptionBlock } from './OptionBlock.js';

export class FloatBlock extends OptionBlock {
    constructor(key, label, value = null, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'float';
        this._timeout = null;
        this._delay = this.options?.delay ?? 2000;
        this._placeholder = this.options?.placeholder ?? '';
    }

    render(container) {
        const wrapper = super.render();
        wrapper.classList.add('float');

        const label = document.createElement('label');
        label.textContent = this.label;
        wrapper.appendChild(label);

        const input = document.createElement('input');
        input.type = 'number';
        input.step = 'any';
        input.placeholder = this._placeholder;
        input.value = this.value ?? '';
        wrapper.appendChild(input);

        const progress = document.createElement('div');
        progress.className = 'save-progress';
        wrapper.appendChild(progress);

        input.addEventListener('input', (e) => {
            this.value = parseFloat(e.target.value);

            // Reset barre
            progress.style.transition = 'none';
            progress.style.width = '0';

            if (this._timeout) clearTimeout(this._timeout);

            requestAnimationFrame(() => {
                progress.style.transition = `width ${this._delay}ms linear`;
                progress.style.width = '100%';
            });

            this._timeout = setTimeout(() => {
                this.notifyChange();
                progress.style.transition = 'none';
                progress.style.width = '0';
            }, this._delay);
        });

        container.appendChild(wrapper);
    }
}
