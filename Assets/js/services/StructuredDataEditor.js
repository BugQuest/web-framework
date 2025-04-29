import Builder from '@framework/js/services/Builder.js';
import {MediaBlock} from '@framework/js/options/MediaBlock';
import {LazySmooth} from '@framework/js/services/LazySmooth.js';
import PromptDialog from '@framework/js/services/PromptDialog.js';
import {Toast} from '@framework/js/services/Toast';

export default class StructuredDataEditor {
    constructor(container) {
        this.container = container;

        this.schemaTypes = {
            "WebSite": {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "",
                "url": "",
                "description": "",
                "publisher": {
                    "@type": "Organization",
                    "name": "",
                    "logo": {
                        "@type": "ImageObject",
                        "url": ""
                    }
                }
            },
            "Organization": {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "",
                "url": "",
                "logo": {
                    "@type": "ImageObject",
                    "url": ""
                },
                "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "",
                    "contactType": ""
                }
            },
            "LocalBusiness": {
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                "name": "",
                "image": "",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "",
                    "addressLocality": "",
                    "postalCode": "",
                    "addressCountry": ""
                },
                "telephone": "",
                "url": ""
            },
            "Article": {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "",
                "image": "",
                "author": {
                    "@type": "Person",
                    "name": ""
                },
                "datePublished": "",
                "dateModified": ""
            },
            "Product": {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": "",
                "image": "",
                "description": "",
                "sku": "",
                "brand": {
                    "@type": "Brand",
                    "name": ""
                }
            }
        };

        this.fieldDescriptions = {
            "name": "Nom de l'entité (site, entreprise, produit, auteur, etc.).",
            "url": "Adresse URL principale.",
            "description": "Brève description de l'entité.",
            "publisher": "Organisation éditrice du site.",
            "logo": "URL du logo officiel.",
            "image": "Image principale associée.",
            "contactPoint": "Informations de contact client.",
            "telephone": "Numéro de téléphone principal.",
            "contactType": "Type de contact (support client, service commercial, etc.).",
            "address": "Adresse physique de l'établissement.",
            "streetAddress": "Adresse postale (rue, numéro, etc.).",
            "addressLocality": "Ville.",
            "postalCode": "Code postal.",
            "addressCountry": "Pays.",
            "headline": "Titre principal de l’article.",
            "author": "Auteur de l'article.",
            "datePublished": "Date de publication au format ISO (ex: 2024-04-28).",
            "dateModified": "Date de dernière modification au format ISO (ex: 2024-04-30).",
            "sku": "Référence SKU (Stock Keeping Unit) du produit.",
            "brand": "Marque ou fabricant du produit."
        };


        this.currentData = {};
        this.inputs = {};

        this.init();
    }

    init() {
        this.container.innerHTML = '';
        const wrapper = Builder.div('structured-data');
        this.container.appendChild(wrapper);

        const types = Object.keys(this.schemaTypes).map(type => ({label: type, value: type}));

        const group = Builder.div('structured-data-group');
        wrapper.appendChild(group);

        this.selectType = Builder.select('Charger un Modèle', types, null, (type) => this.onTypeChange(type));
        group.appendChild(this.selectType.getElement());

        const typeInputWrapper = Builder.div('input-wrapper');
        const typeLabel = Builder.label('@type');
        this.typeInput = Builder.input_text('', '');
        this.typeInput.addEventListener('input', (e) => {
            this.currentType = e.target.value;
            this.updatePreview();
        });
        typeInputWrapper.appendChild(typeLabel);
        typeInputWrapper.appendChild(this.typeInput);
        group.appendChild(typeInputWrapper);

        this.formContainer = Builder.div('structured-form');
        group.appendChild(this.formContainer);

        this.preview = Builder.textarea('', '', 'structured-preview');
        this.preview.readOnly = true;
        wrapper.appendChild(this.preview);

        this.currentType = "Thing";
        this.currentData = {};
        this.renderForm();
        this.updatePreview();
    }

    onTypeChange(type) {
        this.currentType = type;
        this.typeInput.value = type;
        this.currentData = JSON.parse(JSON.stringify(this.schemaTypes[type]));
        this.renderForm();
        this.updatePreview();
    }

    renderForm() {
        this.formContainer.innerHTML = '';
        this.renderSubForm(this.currentData, this.formContainer);
        LazySmooth.process();
    }

    renderSubForm(data, container) {
        Object.keys(data).forEach(key => {
            if (key.startsWith('@')) return;
            this.renderField(key, data[key], container, data);
        });

        const actions = Builder.div('subform-actions');

        const addFieldBtn = Builder.button('+ Champ', '', () => this.addField(data, container));
        actions.appendChild(addFieldBtn);

        const addObjectBtn = Builder.button('+ Objet', '', () => this.addSubObject(data, container));
        actions.appendChild(addObjectBtn);

        container.appendChild(actions);
    }

    renderField(key, value, container, parentData) {
        const wrapper = Builder.div('input-wrapper');
        wrapper.dataset.key = key;

        const keyInput = Builder.input_text('', key);
        keyInput.classList.add('key-input');

        keyInput.addEventListener('input', (e) => {
            this.renameField(key, e.target.value, parentData);
        });

        wrapper.appendChild(keyInput);

        if (typeof value === 'object' && value !== null) {
            const subContainer = Builder.div('sub-container');
            this.renderSubForm(value, subContainer);
            wrapper.appendChild(subContainer);
        } else {
            const valInput = Builder.input_text('', value);
            valInput.addEventListener('input', (e) => {
                parentData[key] = e.target.value;
                this.doChange();
                this.updatePreview();
            });
            wrapper.appendChild(valInput);
        }

        const actions = Builder.div('field-actions');

        const toObjectBtn = Builder.button('Obj', '', () => {
            parentData[key] = {};
            this.renderForm();
            this.updatePreview();
        });
        actions.appendChild(toObjectBtn);

        const deleteBtn = Builder.button('Suppr', '', () => {
            this.removeField(key, parentData);
            this.updatePreview();
        });
        actions.appendChild(deleteBtn);

        wrapper.appendChild(actions);
        container.appendChild(wrapper);
    }

    addField(parentData, container) {
        PromptDialog.show(
            (key) => {
                if (!key) return;
                if (parentData[key]) {
                    Toast.error('Ce champ existe déjà.');
                    return;
                }
                parentData[key] = '';
                this.renderForm();
                this.updatePreview();
                this.doChange();
            },
            () => {
            },
            {
                title: 'Ajouter un champ',
                message: 'Nom du nouveau champ :',
                placeholder: 'ex: headline',
                defaultValue: ''
            }
        );
    }

    addSubObject(parentData, container) {
        PromptDialog.show(
            (key) => {
                if (!key) return;
                if (parentData[key]) {
                    Toast.error('Ce champ existe déjà.');
                    return;
                }
                parentData[key] = {"@type": ""};
                this.renderForm();
                this.updatePreview();
                this.doChange();
            },
            () => {
            },
            {
                title: 'Ajouter un sous-objet',
                message: 'Nom du nouveau sous-objet :',
                placeholder: 'ex: contactPoint',
                defaultValue: ''
            }
        );
    }

    renameField(oldKey, newKey, parentData) {
        if (!newKey || newKey === oldKey) return;
        if (parentData[newKey]) {
            Toast.error('Clé déjà existante.');
            return;
        }
        parentData[newKey] = parentData[oldKey];
        delete parentData[oldKey];
        this.renderForm();
        this.updatePreview();
        this.doChange();
    }

    removeField(key, parentData) {
        delete parentData[key];
        this.renderForm();
        this.doChange();
    }

    updatePreview() {
        const output = {
            "@context": "https://schema.org",
            "@type": this.currentType || '',
            ...this.currentData
        };
        this.preview.value = JSON.stringify(output, null, 2);
    }

    getStructuredData() {
        return this.preview.value;
    }

    onChange(callback) {
        this.changeCallback = callback;
    }

    doChange() {
        if (this.changeCallback)
            this.changeCallback(this.getData());
    }

    getData() {
        return {
            "@context": "https://schema.org",
            "@type": this.currentType,
            ...this.currentData
        };
    }

    loadData(data) {
        if (!data["@type"]) return;
        this.currentType = data["@type"];
        this.typeInput.value = data["@type"];
        this.currentData = {};
        if (this.selectType) {
            this.selectType.setValue(data["@type"]);
        }
        for (const key in data) {
            if (key.startsWith('@')) continue;
            this.currentData[key] = data[key];
        }
        this.renderForm();
        this.updatePreview();
    }
}