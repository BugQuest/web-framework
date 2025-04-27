import Builder from '@framework/js/services/Builder.js';

export default class Keywords {
    constructor({
                    label,
                    placeholder = 'Ajouter un mot clé...',
                    initial = [],
                    onChange = null,
                    className = ''
                }) {
        this.label = label;
        this.placeholder = placeholder;
        this.keywords = Array.isArray(initial) ? [...initial] : [];
        this.onChange = onChange;
        this.className = className;

        this.build();
    }

    build() {
        this.wrapper = Builder.div('keywords-wrapper');
        if (this.className)
            this.wrapper.classList.add(this.className);

        this.labelEl = Builder.div('keywords-label');
        this.labelEl.textContent = this.label;

        this.inputWrapper = Builder.div('keywords-input-wrapper');
        this.inputEl = Builder.input_text('','','keywords-input');
        this.inputEl.type = 'text';
        this.inputEl.placeholder = this.placeholder;

        this.tagsWrapper = Builder.div('keywords-tags');

        this.inputWrapper.append(this.inputEl);
        this.wrapper.append(this.labelEl, this.tagsWrapper, this.inputWrapper);

        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = this.inputEl.value.trim();
                if (value) {
                    this.addKeyword(value);
                    this.inputEl.value = '';
                }
            }
        });

        this.tagsWrapper.addEventListener('click', (e) => {
            if (e.target.classList.contains('keyword-remove')) {
                const keyword = e.target.parentNode.dataset.keyword;
                this.removeKeyword(keyword);
            }
        });

        this.renderTags();
    }

    addKeyword(value) {
        if (!this.keywords.includes(value)) {
            this.keywords.unshift(value);
            this.renderTags();
            if (this.onChange) this.onChange(this.getValue());
        }
    }

    removeKeyword(value) {
        const index = this.keywords.indexOf(value);
        if (index !== -1) {
            this.keywords.splice(index, 1);
            this.renderTags();
            if (this.onChange) this.onChange(this.getValue());
        }
    }

    renderTags() {
        this.tagsWrapper.innerHTML = '';
        this.keywords.forEach(keyword => {
            const tag = Builder.div('keyword-tag');
            tag.dataset.keyword = keyword;

            const label = Builder.span('keyword-text');
            label.textContent = keyword;

            const remove = Builder.span('keyword-remove');
            remove.textContent = '✖';

            tag.append(label, remove);
            this.tagsWrapper.append(tag);
        });
    }

    getValue() {
        return [...this.keywords];
    }

    getString(separator = ',') {
        return this.keywords.join(separator);
    }

    getElement() {
        return this.wrapper;
    }

    setValue(list) {
        this.keywords = Array.isArray(list) ? [...list] : [];
        this.renderTags();
        if (this.onChange) this.onChange(this.getValue());
    }

    destroy() {
        this.inputEl.removeEventListener('keydown', this.handleInput);
        this.tagsWrapper.removeEventListener('click', this.handleRemove);
    }
}
