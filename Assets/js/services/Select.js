import Builder from '@framework/js/services/Builder.js';

export default class Select {
    constructor({
                    label,
                    options,
                    selected = null,
                    onChange = null,
                    placeholder = 'Sélectionner…',
                    multiple = false,
                    className = '',
                    useSearch = false
                }) {
        this.label = label;
        this.options = options;
        this.onChange = onChange;
        this.placeholder = placeholder;
        this.multiple = multiple;
        this.className = className;
        this.useSearch = useSearch;
        this.isObjectOption = typeof options[0] === 'object';
        this.validValues = options.map(opt => this.isObjectOption ? opt.value : opt);
        this.currentValue = multiple
            ? Array.isArray(selected) ? selected.filter(v => this.validValues.includes(v)) : []
            : this.validValues.includes(selected) ? selected : null;
        this.build();
    }

    build() {
        this.wrapper = Builder.div('select-wrapper');
        if (this.className) this.wrapper.classList.add(this.className);
        this.wrapper.setAttribute('role', 'listbox');
        this.wrapper.tabIndex = 0;

        this.head = Builder.div('select-head');
        this.labelEl = Builder.div('select-label');
        this.labelEl.textContent = this.label;
        this.valueEl = Builder.div('select-value');

        this.head.append(this.labelEl, this.valueEl);
        this.wrapper.append(this.head);

        this.head.addEventListener('click', () => this.toggle(true));

        document.addEventListener('click', (e) => {
            if (!this.wrapper.contains(e.target) && this.bodyEl && !this.bodyEl.contains(e.target)) {
                this.toggle(false);
            }
        });

        this.updateDisplay();
    }

    renderBody() {
        if (this.bodyEl) return;

        this.bodyEl = Builder.div('select-body');
        document.body.appendChild(this.bodyEl);

        const rect = this.wrapper.getBoundingClientRect();
        this.bodyEl.style.position = 'absolute';
        this.bodyEl.style.top = `${rect.bottom + window.scrollY + 6}px`;
        this.bodyEl.style.left = `${rect.left + window.scrollX}px`;
        this.bodyEl.style.width = `${rect.width}px`;

        if (this.useSearch) {
            this.searchInput = Builder.input_text('Rechercher…', '', 'select-search');
            this.searchInput.addEventListener('input', () => {
                const value = this.searchInput.value;
                this.renderOptions(value);
            });
            this.bodyEl.appendChild(this.searchInput);
        }

        this.optionsContainer = Builder.div('select-options');
        this.bodyEl.appendChild(this.optionsContainer);

        this.bodyEl.classList.add('opening');
        requestAnimationFrame(() => this.bodyEl.classList.add('active'));

        this.renderOptions();
    }

    setOptions(options) {
        this.options = options;
        this.isObjectOption = typeof options[0] === 'object';
        this.validValues = options.map(opt => this.isObjectOption ? opt.value : opt);
        this.currentValue = this.multiple
            ? Array.isArray(this.currentValue) ? this.currentValue.filter(v => this.validValues.includes(v)) : []
            : this.validValues.includes(this.currentValue) ? this.currentValue : null;

        if (this.bodyEl)
            this.renderOptions();
    }

    renderOptions(filter = '') {
        if (!this.optionsContainer) return;
        this.optionsContainer.innerHTML = '';

        const fragment = document.createDocumentFragment();
        let matchCount = 0;

        // Séparer les options en deux groupes
        const filteredOptions = this.options.filter(option => {
            const label = this.isObjectOption ? option.label : option;
            return !filter || label.toLowerCase().includes(filter.toLowerCase());
        });

        const selected = filteredOptions.filter(option => {
            const value = this.isObjectOption ? option.value : option;
            return this.isSelected(value);
        });

        const unselected = filteredOptions.filter(option => {
            const value = this.isObjectOption ? option.value : option;
            return !this.isSelected(value);
        });

        const finalList = [...selected, ...unselected];

        finalList.forEach(option => {
            const value = this.isObjectOption ? option.value : option;
            const label = this.isObjectOption ? option.label : option;

            const item = Builder.div('select-item');
            item.setAttribute('role', 'option');
            item.dataset.value = value;
            item.textContent = label;

            if (this.isSelected(value)) item.classList.add('active');

            item.addEventListener('click', (e) => this.select(e, value));
            fragment.appendChild(item);
            matchCount++;
        });

        if (matchCount === 0) {
            const empty = Builder.div('select-empty');
            empty.textContent = 'Aucun résultat';
            this.optionsContainer.appendChild(empty);
        } else {
            this.optionsContainer.appendChild(fragment);
        }
    }

    toggle(show) {
        if (show && !this.bodyEl) {
            this.renderBody();
        } else if (!show && this.bodyEl) {
            this.bodyEl.classList.remove('opening');
            this.bodyEl.classList.add('closing');
            setTimeout(() => {
                if (this.bodyEl && this.bodyEl.parentNode) {
                    this.bodyEl.remove();
                    this.bodyEl = null;
                    this.searchInput = null;
                    this.optionsContainer = null;
                }
            }, 250);
        }
    }

    select(e, value) {
        if (!this.validValues.includes(value)) return;

        if (this.multiple) {
            const index = this.currentValue.indexOf(value);
            if (index >= 0) {
                this.currentValue.splice(index, 1);
                e.target.classList.remove('active');
            } else {
                this.currentValue.push(value);
                e.target.classList.add('active');
            }
        } else {
            this.currentValue = value;
            this.toggle(false);
        }

        this.updateDisplay();
        if (this.onChange) this.onChange(this.getValue());
    }

    isSelected(value) {
        return this.multiple
            ? this.currentValue.includes(value)
            : this.currentValue === value;
    }

    updateDisplay() {
        const labels = this.multiple
            ? this.currentValue.map(v =>
                (this.options.find(opt => (this.isObjectOption ? opt.value === v : opt === v)) || {}).label || v
            )
            : [this.options.find(opt => (this.isObjectOption ? opt.value === this.currentValue : opt === this.currentValue))?.label || this.currentValue];

        this.valueEl.textContent = labels.filter(Boolean).join(', ') || this.placeholder;
    }

    setValue(value) {
        if (this.multiple) {
            this.currentValue = Array.isArray(value) ? value.filter(v => this.validValues.includes(v)) : [];
        } else {
            this.currentValue = this.validValues.includes(value) ? value : null;
        }

        this.updateDisplay();
    }

    getValue() {
        return this.multiple ? [...this.currentValue] : this.currentValue;
    }

    getElement() {
        return this.wrapper;
    }

    destroy() {
        if (this.bodyEl && this.bodyEl.parentNode) this.bodyEl.remove();
        this.wrapper.remove();
    }
}
