import {__} from '@framework/js/services/Translator.js';
import Select from '@framework/js/services/Select.js';
import Keywords from '@framework/js/services/Keywords.js';

export default class Builder {

    static createEl = (tag, className, text = '') => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text) el.innerText = text;
        return el;
    }

    static accordion(title, subclass) {
        let accordeon = this.div('__accordeon accordeon');
        if (subclass) accordeon.classList.add(subclass);

        let accordeon_title = this.div('__accordeon_title accordeon-title');
        accordeon_title.textContent = title;
        accordeon.appendChild(accordeon_title);

        let accordeon_content = this.div('__accordeon_content accordeon-content');
        accordeon.appendChild(accordeon_content);

        return {accordeon, accordeon_content};
    }

    static glow_stick() {
        return this.div('glow-stick');
    }

    static label(text = '', className = '') {
        return this.createEl('label', className, text);
    }

    static input_text(placeholder = '', value = '', className = '') {
        let input = this.createEl('input', className);
        input.type = 'text';
        if (placeholder) input.placeholder = placeholder;
        if (value) input.value = value;
        return input;
    }

    static textarea(placeholder = '', value = '', className = '') {
        let textarea = this.createEl('textarea', className);
        if(placeholder) textarea.placeholder = placeholder;
        if (value) textarea.value = value;
        return textarea;
    }

    static input_number(placeholder = '', step = 1, value = '', className = '') {
        let input = this.createEl('input', className);
        input.type = 'number';
        if (step) input.step = step;
        if (placeholder) input.placeholder = placeholder;
        if (value) input.value = value;
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
        let checkbox = this.createEl('input', 'checkbox');
        checkbox.type = 'checkbox';
        if (checked) checkbox.checked = true;
        if (onChange) checkbox.addEventListener('change', onChange);

        let labelElement = this.label(label);
        labelElement.prepend(checkbox);

        return labelElement;
    }

    static switch(checked = false, onChange = null) {
        let switcher = this.div('switch');
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
        let button = this.createEl('button', className, text);
        button.type = 'submit';
        return button;
    }

    static button(text = 'Button', className = 'button', onClick = null) {
        let button = this.createEl('button', className, text);
        if (onClick) button.addEventListener('click', onClick);
        return button;
    }

    static div(className = '') {
        return this.createEl('div', className);
    }

    static span(className = '') {
        return this.createEl('span', className);
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
        return this.createEl('h2', className, content);
    }

    static h3(content, className = '') {
        return this.createEl('h3', className, content);
    }

    static h4(content, className = '') {
        return this.createEl('h4', className, content);
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
                  openBottom = false,
                  className = '') {
        let element = this.div('search-container');
        if (className) element.classList.add(className);
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
            getValue: () => {
                return input.value;
            },
            setValue: (value) => {
                input.value = value;
                results.innerHTML = '';
            },
            element
        };
    }

    static select(label, options, selected = null, onChange = null, bottom = false, placeholder = '', className = '') {

        return new Select({
            label: label,
            options: options,
            selected: selected,
            onChange: onChange,
            multiple: false,
            placeholder: placeholder,
            bottom: bottom,
            className: className,
        })
    }


    static selectMultiple(label, options, selected = [], onChange = null, bottom = false, placeholder = '', className = '') {
        return new Select({
            label: label,
            options: options,
            selected: selected,
            onChange: onChange,
            multiple: true,
            placeholder: placeholder,
            bottom: bottom,
            className: className,
        })
    }

    static table(head = [], body = [], className = '', headClassName = '', bodyClassName = '') {
        let table = this.createEl('table', className);

        let thead = document.createElement('thead');
        let tbody = document.createElement('tbody');

        if (head.length > 0)
            head.forEach(item => thead.appendChild(this.createEl('th', headClassName, item)));


        if (body.length > 0) {
            body.forEach(item => {
                let tr = this.createEl('tr');
                item.forEach(cell => {
                    let td = this.createEl('td', bodyClassName);

                    if (typeof cell === 'object' && cell !== null && 'value' in cell && 'full' in cell) {
                        td.textContent = cell.value;
                        td.title = cell.full;
                        td.classList.add('truncated'); // on l’utilisera pour le CSS
                    } else {
                        td.textContent = cell;
                    }

                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        }

        table.appendChild(thead);
        table.appendChild(tbody);

        return table;
    }

    static input_search_list(label, options = [], className = '') {
        const wrapper = this.div('input-wrapper');

        const labelEl = this.label(label);
        wrapper.appendChild(labelEl);

        const input = this.input_text('User-agent: *', '', className);
        wrapper.appendChild(input);

        const datalist = document.createElement('datalist');
        datalist.id = 'list-' + Math.random().toString(36).substr(2, 9);
        input.setAttribute('list', datalist.id);
        wrapper.appendChild(datalist);

        input.setOptions = (opts) => {
            datalist.innerHTML = '';
            opts.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                datalist.appendChild(opt);
            });
        };

        input.getElement = () => wrapper;

        return input;
    }

    static keywords(label, placeholder = 'Ajouter un mot clé...', initial = [], onChange = null, className = '') {
        return new Keywords({
            label: label,
            placeholder: placeholder,
            initial: initial,
            onChange: onChange,
            className: className,
        });
    }
}