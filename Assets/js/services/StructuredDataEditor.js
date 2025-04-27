import Builder from '@framework/js/services/Builder.js';

export default class StructuredDataEditor {
    constructor(container) {
        this.container = container;
        this.schemaTypes = {
            'Article': {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "",
                "image": "",
                "author": "",
                "datePublished": "",
                "dateModified": ""
            },
            'Product': {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "",
                "image": "",
                "description": "",
                "sku": "",
                "brand": ""
            },
            'Organization': {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "",
                "url": "",
                "logo": "",
                "contactPoint": ""
            }
        };

        this.currentData = {};

        this.init();
    }

    init() {
        this.container.innerHTML = '';

        //convert to objects array of {label: 'Article', value: 'Article'}
        const types = Object.keys(this.schemaTypes).map(type => {
            return {
                label: type,
                value: type
            };
        });

        this.selectType = Builder.select('Type', types, null, (type) => this.onTypeChange(type));
        this.container.appendChild(this.selectType.getElement());

        this.formContainer = Builder.div('structured-form');
        this.container.appendChild(this.formContainer);

        this.preview = Builder.textarea('', '', 'structured-preview');
        this.preview.readOnly = true;
        this.container.appendChild(this.preview);
    }

    onTypeChange(type) {
        this.currentType = type;
        this.currentData = JSON.parse(JSON.stringify(this.schemaTypes[type]));
        this.renderForm();
        this.updatePreview();
    }

    renderForm() {
        this.formContainer.innerHTML = '';

        for (const key in this.currentData) {
            if (key.startsWith('@')) continue;

            const wrapper = Builder.div('input-wrapper');
            const label = Builder.label(key);
            const input = Builder.input_text('', this.currentData[key]);

            input.addEventListener('input', (e) => {
                this.currentData[key] = e.target.value;
                this.updatePreview();
            });

            wrapper.appendChild(label);
            wrapper.appendChild(input);
            this.formContainer.appendChild(wrapper);
        }
    }

    updatePreview() {
        const output = {
            "@context": "https://schema.org",
            "@type": this.currentType,
            ...this.filterEmptyFields(this.currentData)
        };

        this.preview.value = JSON.stringify(output, null, 2);
    }

    filterEmptyFields(data) {
        const cleaned = {};
        for (const key in data) {
            if (data[key] !== '') cleaned[key] = data[key];
        }
        return cleaned;
    }

    getStructuredData() {
        return this.preview.value;
    }
}
