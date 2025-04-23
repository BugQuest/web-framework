import { OptionBlock } from './OptionBlock.js';

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

        const switcher = document.createElement('div');
        switcher.className = 'bool-switch';
        switcher.dataset.state = this.value ? 'on' : 'off';
        switcher.title = this.value ? 'Activé' : 'Désactivé';

        switcher.addEventListener('click', () => {
            this.value = !this.value;
            switcher.dataset.state = this.value ? 'on' : 'off';
            switcher.title = this.value ? 'Activé' : 'Désactivé';
            this.notifyChange();
        });

        wrapper.appendChild(switcher);
        container.appendChild(wrapper);
    }
}
