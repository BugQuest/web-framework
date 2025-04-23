import { OptionBlock } from './OptionBlock.js';

export class StringBlock extends OptionBlock {
    render(container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'option-block string';

        const label = document.createElement('label');
        label.textContent = this.label;
        wrapper.appendChild(label);

        const input = document.createElement('input');
        input.type = 'text';
        input.value = this.value ?? '';
        input.addEventListener('input', (e) => {
            this.setValue(e.target.value);
            this.notifyChange();
        });

        wrapper.appendChild(input);
        container.appendChild(wrapper);
    }
}
