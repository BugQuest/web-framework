import { OptionBlock } from './OptionBlock.js';

export class IntBlock extends OptionBlock {
    render(container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'option-block int';

        const label = document.createElement('label');
        label.textContent = this.label;
        wrapper.appendChild(label);

        const input = document.createElement('input');
        input.type = 'number';
        input.step = '1';
        input.value = this.value ?? '';
        input.addEventListener('input', (e) => {
            this.setValue(parseInt(e.target.value));
            this.notifyChange();
        });

        wrapper.appendChild(input);
        container.appendChild(wrapper);
    }
}
