import {OptionBlock} from './OptionBlock.js';

export class BoolBlock extends OptionBlock {
    constructor(key, label, value = false, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'bool';
    }

    render(container) {
        const wrapper = super.render();
        wrapper.classList.add('bool');

        const label = document.createElement('label');
        label.textContent = this.label;
        wrapper.appendChild(label);

        const toggle = document.createElement('div');
        toggle.className = 'switch-container';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = !!this.value;
        input.id = `toggle_${this.key}`;
        input.addEventListener('change', (e) => {
            this.setValue(e.target.checked);
            this.notifyChange();
        });

        const slider = document.createElement('label');
        slider.className = 'switch-slider';
        slider.setAttribute('for', input.id);

        toggle.appendChild(input);
        toggle.appendChild(slider);
        wrapper.appendChild(toggle);

        container.appendChild(wrapper);
    }
}
