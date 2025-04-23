import Builder from '@framework/js/services/Builder';

export default class UrlPicker {
    static modal = null;
    static search = null;
    static url_input = null;
    static title_input = null;
    static blank_switcher = null;
    static debounceTimer = null;
    static delay = 2000;

    static open(url, title, blank, onValid = null) {
        if (!this.modal) {
            this.modal = Builder.modal(
                null,
                () => {
                },
                () => {
                    this.search.close();
                }
            );
            document.body.appendChild(this.modal.element);

            const wrapper = Builder.div('container-form');
            this.modal.content.appendChild(wrapper);

            const form_header = Builder.div('form-header');
            wrapper.appendChild(form_header);

            const form_body = Builder.div('form-body');
            wrapper.appendChild(form_body);

            const form_footer = Builder.div('form-footer');
            wrapper.appendChild(form_footer);

            //@todo search for pages or force url
            this.search = Builder.search(
                'Rechercher une page',
                this.onSearch,
                this.onSearchClickItem,
                4,
                true
            )
            form_header.appendChild(this.search.element);

            const form_group_url = Builder.div('form-group');
            const form_group_title = Builder.div('form-group');
            const form_group_blank = Builder.div('form-group');
            form_body.appendChild(form_group_url);
            form_body.appendChild(form_group_title);
            form_body.appendChild(form_group_blank);

            this.url_input = Builder.input_text('URL', '', 'fullw');
            this.title_input = Builder.input_text('Titre', '', 'fullw');

            const label = Builder.label('Ouvrir dans un nouvel onglet ?');
            this.blank_switcher = Builder.switch();

            form_group_url.appendChild(this.url_input);
            form_group_title.appendChild(this.title_input);


            form_group_blank.appendChild(label);
            form_group_blank.appendChild(this.blank_switcher.element);

            if (onValid) {
                this.btn = Builder.button('Valider', 'form-submit', () => {
                    onValid(this.url_input.value, this.title_input.value, this.blank_switcher.value())
                    this.modal.close();
                });
                form_footer.appendChild(this.btn);
            }
        }

        if (url)
            this.url_input.value = url;

        if (title)
            this.title_input.value = title;

        if (blank)
            this.blank_switcher.toggle(blank);

        this.modal.open();
    }

    static onSearch(value) {
        UrlPicker.debounce(() => {
            fetch('/admin/api/page/search/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    'search': value,
                }),
            })
                .then(res => {
                    if (res.status === 404) {
                        UrlPicker.search.clean();
                        return;
                    }
                    return res.json();
                })
                .then(data => {
                    if (!data) return;

                    UrlPicker.search.clean();
                    data.forEach((item) => UrlPicker.search.addItem(item.title, item));
                })
        })
    }

    static onSearchClickItem(item) {
        UrlPicker.title_input.value = item.title;
        UrlPicker.url_input.value = '/' + item.slug;
        UrlPicker.search.close();
    }

    static debounce(callback, delay) {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(callback, delay);
    }
}