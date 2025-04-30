import Builder from '@framework/js/services/Builder.js';

export default class Select {
    constructor({
                    label,
                    options,
                    selected = null,
                    onChange = null,
                    bottom = false,
                    placeholder = 'Sélectionner…',
                    multiple = false,
                    className = '',
                }) {
        this.label = label;
        this.options = options;
        this.onChange = onChange;
        this.bottom = bottom;
        this.placeholder = placeholder;
        this.multiple = multiple;
        this.className = className;
        this.isObjectOption = typeof options[0] === 'object';
        this.validValues = options.map(opt => this.isObjectOption ? opt.value : opt);

        this.currentValue = multiple
            ? Array.isArray(selected) ? selected.filter(v => this.validValues.includes(v)) : []
            : this.validValues.includes(selected) ? selected : null;

        this.clickHandler = this.handleClick.bind(this);

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
        this.body = Builder.div('select-body');

        this.head.append(this.labelEl, this.valueEl);
        this.wrapper.append(this.head, this.body);

        this.renderOptions();
        this.updateDisplay();

        this.head.addEventListener('click', () => this.toggle(true));
        this.wrapper.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.toggle(true);
            if (e.key === 'Escape') this.toggle(false);
        });

        this.body.addEventListener('click', this.clickHandler);

        this.closeHandler = (e) => {
            if (!this.wrapper.contains(e.target)) this.toggle(false);
        };
        document.addEventListener('click', this.closeHandler);
    }

    renderOptions() {
        this.body.innerHTML = '';
        const fragment = document.createDocumentFragment();

        this.options.forEach(option => {
            const value = this.isObjectOption ? option.value : option;
            const label = this.isObjectOption ? option.label : option;

            const item = Builder.div('select-item');
            item.setAttribute('role', 'option');
            item.textContent = label;
            item.dataset.value = value;

            if (this.isSelected(value)) {
                item.classList.add('active');
            }

            fragment.appendChild(item);
        });

        this.body.appendChild(fragment);
    }

    handleClick(e) {
        if (!e.target.classList.contains('select-item')) return;
        const value = e.target.dataset.value;
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
            [...this.body.children].forEach(item => {
                item.classList.toggle('active', item.dataset.value === value);
            });
            this.toggle(false);
        }

        this.updateDisplay();
        if (this.onChange) this.onChange(this.getValue());
    }

    toggle(enabled) {
        if (enabled) {
            if (!this.bodyTeleport) {
                this.bodyTeleport = this.body.cloneNode(true);
                this.bodyTeleport.classList.add('teleport-select-body');
                document.body.appendChild(this.bodyTeleport);

                const rect = this.wrapper.getBoundingClientRect();
                this.bodyTeleport.style.position = 'absolute';
                this.bodyTeleport.style.top = `${rect.bottom + window.scrollY + 6}px`;
                this.bodyTeleport.style.left = `${rect.left + window.scrollX}px`;
                this.bodyTeleport.style.width = `${rect.width}px`;

                this.bodyTeleport.addEventListener('click', this.clickHandler);

                // Nouveaux listeners pour fermer au scroll / resize
                // this.scrollHandler = () => this.toggle(false);
                this.resizeHandler = () => this.toggle(false);
                // window.addEventListener('scroll', this.scrollHandler, { passive: true });
                window.addEventListener('resize', this.resizeHandler);
            }
            this.bodyTeleport.classList.add('active');
        } else {
            if (this.bodyTeleport) {
                this.bodyTeleport.classList.remove('active');
                setTimeout(() => {
                    if (this.bodyTeleport && !this.bodyTeleport.classList.contains('active')) {
                        this.bodyTeleport.removeEventListener('click', this.clickHandler);
                        document.body.removeChild(this.bodyTeleport);
                        this.bodyTeleport = null;

                        // Nettoyer les listeners
                        window.removeEventListener('scroll', this.scrollHandler);
                        window.removeEventListener('resize', this.resizeHandler);
                    }
                }, 300);
            }
        }
    }

    isSelected(value) {
        return this.multiple
            ? this.currentValue.includes(value)
            : this.currentValue === value;
    }

    updateDisplay() {
        let labels = [];

        if (this.multiple) {
            labels = this.currentValue.map(val => {
                const opt = this.options.find(opt => (this.isObjectOption ? opt.value === val : opt === val));
                return opt ? (this.isObjectOption ? opt.label : opt) : val;
            });
        } else if (this.currentValue !== null) {
            const opt = this.options.find(opt => (this.isObjectOption ? opt.value === this.currentValue : opt === this.currentValue));
            if (opt) labels = [this.isObjectOption ? opt.label : opt];
        }

        this.valueEl.innerText = labels.length ? labels.join(', ') : this.placeholder;
    }

    setValue(value) {
        if (this.multiple) {
            const values = Array.isArray(value) ? value : [];
            this.currentValue = values.filter(v => this.validValues.includes(v));
        } else {
            this.currentValue = this.validValues.includes(value) ? value : null;
        }

        [...this.body.children].forEach(item => {
            item.classList.toggle('active', this.isSelected(item.dataset.value));
        });

        this.updateDisplay();
    }

    setOptions(newOptions, selected = null) {
        this.options = newOptions;
        this.isObjectOption = typeof this.options[0] === 'object';
        this.validValues = this.options.map(opt => this.isObjectOption ? opt.value : opt);

        this.renderOptions();

        if (selected !== null) {
            this.setValue(selected);
        } else {
            if (this.multiple) {
                this.currentValue = [];
            } else {
                this.currentValue = null;
            }
            this.updateDisplay();
        }
    }

    getValue() {
        return this.multiple
            ? [...this.currentValue]
            : this.currentValue;
    }

    getElement() {
        return this.wrapper;
    }

    destroy() {
        document.removeEventListener('click', this.closeHandler);
        this.body.removeEventListener('click', this.clickHandler);
        if (this.bodyTeleport) {
            this.bodyTeleport.removeEventListener('click', this.clickHandler);
            document.body.removeChild(this.bodyTeleport);
        }
        if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
        if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    }

}