import {__} from '@framework/js/services/Translator.js';

export default class Builder {

    static accordion(title, subclass) {
        let accordeon = document.createElement('div');
        accordeon.className = '__accordeon accordeon';
        if (subclass) accordeon.classList.add(subclass);

        let accordeon_title = document.createElement('div');
        accordeon_title.className = '__accordeon_title accordeon-title';
        accordeon_title.textContent = title;
        accordeon.appendChild(accordeon_title);

        let accordeon_content = document.createElement('div');
        accordeon_content.className = 'accordeon-content';
        accordeon.appendChild(accordeon_content);

        return {accordeon, accordeon_content};
    }

    static glow_stick() {
        let glow_stick = document.createElement('div');
        glow_stick.className = 'glow-bar';
        return glow_stick;
    }

    static label(text = '', className = '') {
        let label = document.createElement('label');
        if (className) label.className = className;
        if (text) label.textContent = text;
        return label;
    }

    static input_text(placeholder = '', value = '', className = '') {
        let input = document.createElement('input');
        input.type = 'text';
        if (placeholder) input.placeholder = placeholder;
        if (value) input.value = value;
        if (className) input.className = className;
        return input;
    }

    static textarea(placeholder = '', value = '', className = '') {
        let textarea = document.createElement('textarea');
        if (placeholder) textarea.placeholder = placeholder;
        if (value) textarea.value = value;
        if (className) textarea.className = className;
        return textarea;
    }

    static input_number(placeholder = '', step = 1, value = '', className = '') {
        let input = document.createElement('input');
        input.type = 'number';
        if (step) input.step = step;
        if (placeholder) input.placeholder = placeholder;
        if (value) input.value = value;
        if (className) input.className = className;
        return input;
    }

    static input_search(placeholder = '', className = '', onSearch = null, onEmpty = null, searchMinLength = 2) {
        let input = this.input_text(placeholder, '', className);
        input.type = 'search';
        input.addEventListener('input', () => {
            let value = input.value;
            if (value.length >= searchMinLength) onSearch(value); else onEmpty();
        });

        return input;
    }

    static input_password(placeholder = '', value = '', className = '') {
        let input = this.input_text(placeholder, value, className);
        input.type = 'password';
        return input;
    }

    static checkbox(label = '', checked = false, className = '', onChange = null) {
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        if (checked) checkbox.checked = true;
        if (className) checkbox.className = className;
        if (onChange) checkbox.addEventListener('change', onChange);

        let labelElement = this.label(label);
        labelElement.prepend(checkbox);

        return labelElement;
    }

    static switch(checked = false, onChange = null) {
        let switcher = document.createElement('div');
        switcher.className = 'switch';
        switcher.dataset.state = checked ? 'on' : 'off';
        switcher.title = checked ? __('Activé', 'options') : __('Désactivé', 'options');
        switcher.addEventListener('click', () => {
            switcher.dataset.state = switcher.dataset.state === 'on' ? 'off' : 'on';
            switcher.title = switcher.dataset.state === 'on' ? __('Activé', 'options') : __('Désactivé', 'options');
            if (onChange) onChange(switcher.dataset.state === 'on');
        });

        return {
            element: switcher,
            value: () => {
                return switcher.dataset.state === 'on';
            },
            toggle: (enabled) => {
                switcher.dataset.state = enabled ? 'on' : 'off';
                switcher.title = enabled ? __('Activé', 'options') : __('Désactivé', 'options');
            }
        };
    }

    static button_submit(text = 'Envoyer', className = 'button button-primary') {
        let button = document.createElement('button');
        button.type = 'submit';
        if (className) button.className = className;
        if (text) button.textContent = text;
        return button;
    }

    static button(text = 'Button', className = 'button', onClick = null) {
        let button = document.createElement('div');
        if (className) button.className = className;
        if (text) button.textContent = text;
        if (onClick) button.addEventListener('click', onClick);
        return button;
    }

    static div(className = '') {
        let div = document.createElement('div');
        if (className) div.className = className;
        return div;
    }

    static span(className = '') {
        let span = document.createElement('span');
        if (className) span.className = className;
        return span;
    }

    static modal(title = '', onOpen = null, onClose = null) {
        const modal = this.div('modal');
        const wrapper = this.div('modal-wrapper');
        const close = this.div('modal-close');
        const content = this.div('modal-content');

        let titleElement = null;
        if (title) {
            titleElement = this.div('modal-title');
            titleElement.textContent = title;
            wrapper.appendChild(titleElement);
        }

        wrapper.appendChild(close);
        wrapper.appendChild(content);
        modal.appendChild(wrapper);

        const closeModal = () => {
            modal.classList.remove('active');
            if (onClose) onClose();
        };

        const openModal = () => {
            modal.classList.add('active');
            if (onOpen) onOpen();
        }

        close.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal)
                closeModal();
        });

        return {
            element: modal,
            open: openModal,
            close: closeModal,
            title: titleElement ?? '',
            content: content,
        };
    }

    static h2(content, className = '') {
        let h2 = document.createElement('h2');
        if (className) h2.className = className;
        h2.textContent = content;
        return h2;
    }

    static h3(content, className = '') {
        let h3 = document.createElement('h3');
        if (className) h3.className = className;
        h3.textContent = content;
        return h3;
    }

    static h4(content, className = '') {
        let h4 = document.createElement('h4');
        if (className) h4.className = className;
        h4.textContent = content;
        return h4;
    }

    static img(src, alt = '', className = '') {
        let img = document.createElement('img');
        img.src = src;
        img.alt = alt ? alt : Math.random().toString(16).slice(2)
        if (className) img.className = className;
        return img;
    }

    static list(items = [], className = '', childClassName = '', onClick = null) {
        let ul = document.createElement('ul');
        if (className) ul.className = className;

        items.forEach(item => {
            let li = document.createElement('li');
            li.innerHTML = item;
            if (childClassName) li.className = childClassName;
            if (onClick) li.addEventListener('click', () => {
                onClick(item);
            });
            ul.appendChild(li);
        });

        return ul;
    }

    static search(placeholder = 'Rechercher...',
                  onSearch = null,
                  onClickItem = null,
                  searchMinLength = 2,
                  openBottom = false) {
        let element = this.div('search-container');
        let input = this.input_text(placeholder);
        input.type = 'search';
        let results = this.div('search-results ' + (openBottom ? ' open-bottom' : 'open-top'));
        element.appendChild(input);
        element.appendChild(results);
        if (onSearch)
            input.addEventListener('input', () => {
                let value = input.value;
                if (value.length >= searchMinLength)
                    onSearch(value);
                else
                    results.innerHTML = '';
            });

        if (onClickItem)
            results.addEventListener('click', (e) => {
                let item_clicked = e.target.closest('.result-item');
                if (!item_clicked) return;
                let item = JSON.parse(item_clicked.dataset.item);
                if (item) onClickItem(item);
            });

        return {
            close: () => {
                results.innerHTML = '';
                input.value = '';
                results.classList.remove('active');
            },
            clean: () => {
                results.innerHTML = '';
            },
            populate: (items) => {
                for (const [key, value] of Object.entries(items)) {
                    const tagEl = Builder.div('result-item');
                    tagEl.textContent = key;
                    tagEl.dataset.item = JSON.stringify(value);
                    results.appendChild(tagEl);
                }
                results.classList.add('active');
            },
            addItem: (label, item) => {
                const tagEl = Builder.div('result-item');
                tagEl.textContent = label;
                tagEl.dataset.item = JSON.stringify(item);
                results.appendChild(tagEl);
                if (!results.classList.contains('active'))
                    results.classList.add('active');
            },
            element
        };
    }

    static select(options = [], value = null, className = '', onChange = null) {
        let select = document.createElement('select');
        if (className) select.className = className;

        //if options is an array of objects, use the label and value properties, else if is simple array of values use the value as label
        if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'object') {
            options.forEach(option => {
                let opt = document.createElement('option');
                opt.value = option.value;
                opt.textContent = option.label;
                if (value && value === option.value) opt.selected = true;
                select.appendChild(opt);
            });
        } else if (Array.isArray(options) && options.length > 0) {
            options.forEach(option => {
                let opt = document.createElement('option');
                opt.value = option;
                opt.textContent = option;
                if (value && value === option) opt.selected = true;
                select.appendChild(opt);
            });
        }

        if (onChange) select.addEventListener('change', () => {
            onChange(select.value);
        });

        return select;
    }

    static table(head = [], body = [], className = '', headClassName = '', bodyClassName = '') {
        let table = document.createElement('table');
        if (className) table.className = className;

        let thead = document.createElement('thead');
        let tbody = document.createElement('tbody');

        if (head.length > 0) {
            head.forEach(item => {
                let th = document.createElement('th');
                th.textContent = item;
                if (headClassName) th.className = headClassName;
                thead.appendChild(th);
            });
        }

        if (body.length > 0) {
            body.forEach(item => {
                let tr = document.createElement('tr');
                item.forEach(cell => {
                    let td = document.createElement('td');

                    if (typeof cell === 'object' && cell !== null && 'value' in cell && 'full' in cell) {
                        td.textContent = cell.value;
                        td.title = cell.full;
                        td.classList.add('truncated'); // on l’utilisera pour le CSS
                    } else {
                        td.textContent = cell;
                    }

                    if (bodyClassName) td.className = bodyClassName;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        }

        table.appendChild(thead);
        table.appendChild(tbody);

        return table;
    }

}