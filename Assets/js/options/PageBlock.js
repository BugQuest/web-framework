import {OptionBlock} from './OptionBlock.js';
import PagePicker from '@framework/js/services/PagePicker.js';
import Builder from '@framework/js/services/Builder.js';

export class PageBlock extends OptionBlock {
    constructor(key, label, value = null, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'id';
        this.class = 'BugQuest\\Framework\\Models\\Database\\Page';
    }

    render(container) {
        const wrapper = super.render();
        wrapper.classList.add('page');

        wrapper.appendChild(Builder.label(this.label));

        const txt_id = Builder.div('text-id');
        txt_id.innerText = this.value?.id ? this.value.id : '';
        wrapper.appendChild(txt_id);

        const txt_title = Builder.div('text-title');
        txt_title.innerText = this.value?.title ? this.value.title : 'Aucun page sélectionnée';
        wrapper.appendChild(txt_title);

        const button = Builder.button('Sélectionner une page', 'save-button', () => {
            PagePicker.open(this.value, (page) => {
                this.value = {
                    id: page.id,
                    class: this.class,
                }

                txt_id.innerText = page.id;
                txt_title.innerText = page.title;

                this.notifyChange();
            })

        });
        wrapper.appendChild(button);
        container.appendChild(wrapper);
    }
}
