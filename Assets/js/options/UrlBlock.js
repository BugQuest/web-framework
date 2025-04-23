import {OptionBlock} from './OptionBlock.js';
import UrlPicker from '@framework/js/services/UrlPicker.js';
import Builder from '@framework/js/services/Builder.js';

export class UrlBlock extends OptionBlock {
    constructor(key, label, value = null, options = {}, onChange = null, group = 'default') {
        super(key, label, value, options, onChange, group);
        this.type = 'object';
    }

    render(container) {
        const wrapper = super.render();
        wrapper.classList.add('url');

        wrapper.appendChild(Builder.label(this.label));

        const txt_url = Builder.div('text-url');
        txt_url.innerText = this.value?.url ? this.value.url : 'Aucune URL sélectionnée';
        wrapper.appendChild(txt_url);

        const txt_title = Builder.div('text-title');
        txt_title.innerText = this.value?.title ? this.value.title : 'Aucun titre sélectionné';
        wrapper.appendChild(txt_title);

        const txt_blank = Builder.div('text-blank');
        txt_blank.innerText = this.value?.blank ? 'Ouvrir dans un nouvel onglet' : 'Ouvrir dans la même fenêtre';
        wrapper.appendChild(txt_blank);

        const button = Builder.button('Sélectionner une URL', 'save-button', () => {
            UrlPicker.open(this.value?.url, this.value?.title, this.value?.blank, (url, title, blank) => {
                this.value = {
                    url: url,
                    title: title,
                    blank: blank
                };

                txt_url.innerText = url;
                txt_title.innerText = title;
                txt_blank.innerText = blank ? 'Ouvrir dans un nouvel onglet' : 'Ouvrir dans la même fenêtre';

                this.notifyChange();
            })

        });
        wrapper.appendChild(button);

        container.appendChild(wrapper);
    }
}
