import {OptionBlock} from './OptionBlock.js';

export class StringBlock extends OptionBlock {
    constructor(key, label, value = null, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'string';
        this._timeout = null;
        this._delay = 2000; // délai avant notification
        this._delay = this.options?.delay ?? 2000;
        this._placeholder = this.options?.placeholder ?? '';
    }

    render(container) {
        const wrapper = super.render();
        wrapper.classList.add('string');

        const label = document.createElement('label');
        label.textContent = this.label;
        wrapper.appendChild(label);

        const input = document.createElement('input');
        input.type = 'text';
        input.value = this.value ?? '';
        if (this._placeholder)
            input.placeholder = this._placeholder;
        wrapper.appendChild(input);

        // Barre de progression
        const progress = document.createElement('div');
        progress.className = 'save-progress';
        wrapper.appendChild(progress);

        input.addEventListener('input', (e) => {
            this.value = e.target.value;

            // Reset animation de la barre
            progress.style.transition = 'none';
            progress.style.width = '0';

            // Reset le timeout précédent
            if (this._timeout) {
                clearTimeout(this._timeout);
            }

            // Lancer animation
            requestAnimationFrame(() => {
                progress.style.transition = `width ${this._delay}ms linear`;
                progress.style.width = '100%';
            });

            // Nouvelle mise à jour différée
            this._timeout = setTimeout(() => {
                this.notifyChange();
                progress.style.transition = 'none';
                progress.style.width = '0';
            }, this._delay);
        });

        container.appendChild(wrapper);
    }
}
