import { OptionBlock } from './OptionBlock.js';

export class FloatBlock extends OptionBlock {
    render(container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'option-block float';

        const label = document.createElement('label');
        label.textContent = this.label;
        wrapper.appendChild(label);

        const input = document.createElement('input');
        input.type = 'number';
        input.step = 'any';
        input.value = this.value ?? '';
        input.addEventListener('input', (e) => {
            this.setValue(parseFloat(e.target.value));
            this.notifyChange();
        });

        wrapper.appendChild(input);
        container.appendChild(wrapper);
    }
}
