export default class BuildHelper {

    static accordion(title, subclass) {
        let accordeon = document.createElement('div');
        accordeon.className = '__accordeon accordeon';
        if (subclass)
            accordeon.classList.add(subclass);

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

    static input_text(placeholder = '', value = '', className = '') {
        let input = document.createElement('input');
        input.type = 'text';
        input.placeholder = placeholder;
        input.value = value;
        input.className = className;
        return input;
    }

    static button_submit(text = 'Envoyer', className = 'button button-primary') {
        let button = document.createElement('button');
        button.type = 'submit';
        button.className = className;
        button.textContent = text;
        return button;
    }

    static div(className = '') {
        let div = document.createElement('div');
        div.className = className;
        return div;
    }

    static modal(title = '', onClose = null) {
        let modal = this.div('modal');
        let wrapper = this.div('modal-wrapper');
        let close = this.div('modal-close');
        let content = this.div('modal-content');

        if (title) {
            let titleElement = this.div('modal-title');
            titleElement.textContent = title;
            modal.appendChild('titleElement');
        }

        wrapper.appendChild(close)
        wrapper.appendChild(content)
        modal.appendChild(wrapper)

        close.addEventListener('click', () => {
            modal.classList.remove('active');
            if (onClose) onClose();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal)
                modal.classList.remove('active');
            if (onClose) onClose();
        });

        return {modal, content, close};
    }

    static h2(content, className = '') {
        let h2 = document.createElement('h2');
        h2.className = className;
        h2.textContent = content;
        return h2;
    }

    static h3(content, className = '') {
        let h3 = document.createElement('h3');
        h3.className = className;
        h3.textContent = content;
        return h3;
    }

    static img(src, alt = '', className = '') {
        let img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        if (className) img.className = className;
        return img;
    }

    static list(items = [], className = '') {
        let ul = document.createElement('ul');
        ul.className = className;

        items.forEach(item => {
            let li = document.createElement('li');
            li.innerHTML = item;
            ul.appendChild(li);
        });

        return ul;
    }

    static search(placeholder = 'Rechercher un média...', onSearch = null, onClickItem = null) {
        let searchContainer = this.div('search-container');
        let input = this.input_text('Rechercher un média...');
        input.type = 'search';
        let results = this.div('search-results open-bottom');
        searchContainer.appendChild(input);
        searchContainer.appendChild(results);
        if (onSearch)
            input.addEventListener('input', () => {
                let value = input.value;
                if (value.length > 2)
                    onSearch(value, results);
                else
                    results.innerHTML = '';

            });

        if (onClickItem)
            results.addEventListener('click', (e) => {
                let item = e.target.closest('.search-item');
                if (item)
                    onClickItem(item);
            });

        return {input, results};
    }

}