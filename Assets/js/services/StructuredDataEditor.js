import Builder from '@framework/js/services/Builder.js';

export default class StructuredDataEditor {
    constructor(container) {
        this.container = container;

        // Définition des types + ajout de descriptions
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

        // Définir des descriptions explicatives
        this.fieldDescriptions = {
            'headline': 'Titre principal de l’article.',
            'image': 'URL de l’image principale.',
            'author': 'Nom de l’auteur de l’article.',
            'datePublished': 'Date de publication au format ISO (ex: 2024-04-28).',
            'dateModified': 'Date de dernière modification au format ISO.',

            'name': 'Nom du produit.',
            'description': 'Courte description du produit.',
            'sku': 'Référence SKU du produit.',
            'brand': 'Marque du produit.',

            'url': 'URL officielle de l’organisation.',
            'logo': 'URL du logo de l’organisation.',
            'contactPoint': 'Point de contact (support client, etc.).',
        };

        this.currentData = {};
        this.inputs = {};

        this.init();
    }

    init() {
        this.container.innerHTML = '';
        const wrapper = Builder.div('structured-data');
        this.container.appendChild(wrapper);

        const types = Object.keys(this.schemaTypes).map(type => ({
            label: type,
            value: type
        }));

        const group = Builder.div('structured-data-group');
        wrapper.appendChild(group);

        this.selectType = Builder.select('Type', types, null, (type) => this.onTypeChange(type));
        group.appendChild(this.selectType.getElement());

        this.formContainer = Builder.div('structured-form');
        group.appendChild(this.formContainer);

        this.preview = Builder.textarea('', '', 'structured-preview');
        this.preview.readOnly = true;
        wrapper.appendChild(this.preview);
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

            this.inputs[key] = input;

            wrapper.appendChild(label);
            wrapper.appendChild(input);

            // Ajout de l'explication si disponible
            if (this.fieldDescriptions[key]) {
                const helpText = Builder.div('input-help');
                helpText.innerText = this.fieldDescriptions[key];
                wrapper.appendChild(helpText);
            }

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

    getData() {
        const data = {
            "@context": "https://schema.org",
            "@type": this.currentType,
        };

        for (const key in this.inputs) {
            const value = this.inputs[key].value.trim();
            if (value !== '') {
                data[key] = value;
            }
        }

        return data;
    }

    loadData(data) {
        if (!data["@type"]) return; // sécurité minimale

        this.currentType = data["@type"];
        this.currentData = {};

        // Nettoyer et repartir de zéro
        if (this.selectType) {
            this.selectType.setValue(data["@type"]);
        }

        this.renderForm();

        for (const key in data) {
            if (key.startsWith('@')) continue; // on ignore @context, @type
            if (this.inputs[key]) {
                this.inputs[key].value = data[key];
                this.currentData[key] = data[key];
            }
        }

        this.updatePreview();
    }
}