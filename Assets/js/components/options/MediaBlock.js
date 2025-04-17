import { OptionBlock } from './OptionBlock.js';

export class MediaBlock extends OptionBlock {
    render(container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'option-block media';

        const label = document.createElement('label');
        label.textContent = this.label;
        wrapper.appendChild(label);

        const input = document.createElement('input');
        input.type = 'hidden';
        input.value = this.value ?? '';
        input.name = this.key;
        wrapper.appendChild(input);

        const preview = document.createElement('div');
        preview.className = 'media-preview';
        preview.textContent = this.value || 'Aucun média sélectionné';
        wrapper.appendChild(preview);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'button';
        button.textContent = 'Choisir un média';
        button.addEventListener('click', () => {
            // 👉 ici, déclenche ton sélecteur personnalisé et set la valeur
            alert('Sélecteur média à connecter ici.');
        });

        wrapper.appendChild(button);
        container.appendChild(wrapper);
    }
}
