import Builder from '@framework/js/services/Builder';

export default class PagePicker {
    static modal = null;
    static search = null;
    static url_input = null;
    static title_input = null;
    static blank_switcher = null;
    static debounceTimer = null;
    static delay = 2000;
    static page = null;

    static open(page, onValid = null) {
        this.page = page;
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

            this.search = Builder.search(
                'Rechercher une page',
                this.onSearch,
                this.onSearchClickItem,
                4,
                true
            )
            form_header.appendChild(this.search.element);

            this.text_page = Builder.div('form-text');
            form_body.appendChild(this.text_page);

            if (onValid) {
                this.btn = Builder.button('Valider', 'form-submit', () => {
                    if (!this.page) return;
                    onValid(this.page)
                    this.modal.close();
                });
                form_footer.appendChild(this.btn);
            }
        }

        if (this.page)
            this.text_page.innerText = this.page.id + ' - ' + this.page.title;

        this.modal.open();
    }

    static onSearch(value) {
        PagePicker.debounce(() => {
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
                        PagePicker.search.clean();
                        return;
                    }
                    return res.json();
                })
                .then(data => {
                    if (!data) return;

                    PagePicker.search.clean();
                    data.forEach((item) => PagePicker.search.addItem(item.title, item));
                })
        })
    }

    static onSearchClickItem(item) {
        PagePicker.page = item;
        PagePicker.text_page.innerText = item.id + ' - ' + item.title;
        PagePicker.search.close();
    }

    static debounce(callback, delay) {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(callback, delay);
    }
}