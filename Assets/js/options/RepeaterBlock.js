import {OptionBlock} from './OptionBlock.js';
import Builder from '@framework/js/services/Builder.js';
import {BlockFactory} from '@framework/js/options/BlockFactory.js';

export class RepeaterBlock extends OptionBlock {
    constructor(key, label, value = [], options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'repeater';
        this.blockDefinitions = options.blocks ?? [];
    }

    render(container) {
        const wrapper = super.render();
        wrapper.classList.add('repeater');

        wrapper.appendChild(Builder.label(this.label));

        const list = Builder.div('repeater-list');
        wrapper.appendChild(list);

        const addBtn = Builder.button('+ Ajouter');
        addBtn.classList.add('add-button');
        wrapper.appendChild(addBtn);

        const renderItem = (itemValue, index) => {
            const itemWrapper = Builder.div('repeater-item');

            // Supprimer
            const deleteBtn = Builder.button('✖');
            deleteBtn.classList.add('delete-button');
            deleteBtn.addEventListener('click', () => {
                this.value.splice(index, 1);
                this.notifyChange();
                this.render(container); // Re-render entier
            });
            itemWrapper.appendChild(deleteBtn);

            // Groupe de blocs
            const groupWrapper = Builder.div('block-group');

            this.blockDefinitions.forEach((def) => {
                const fieldKey = `${this.key}[${index}].${def.key}`;
                const fieldValue = itemValue[def.key] ?? null;

                const block = BlockFactory.create(
                    def.type,
                    fieldKey,
                    def.label,
                    fieldValue,
                    def.options,
                    (val) => {
                        this.value[index][def.key] = val;
                        this.notifyChange();
                    },
                    this.group
                );

                block.render(groupWrapper);
            });

            itemWrapper.appendChild(groupWrapper);
            list.appendChild(itemWrapper);
        };

        this.value.forEach((item, i) => renderItem(item, i));

        addBtn.addEventListener('click', () => {
            const newItem = {};
            this.blockDefinitions.forEach((def) => (newItem[def.key] = null));
            this.value.push(newItem);
            this.notifyChange();
            this.render(container);
        });

        container.appendChild(wrapper);
    }
}
