import Builder from '@framework/js/services/Builder.js';
import {MediaBlock} from '@framework/js/options/MediaBlock';

export default class OpenGraphEditor {
    constructor(container) {
        this.container = container;

        this.requiredFields = {
            'og:title': '',
            'og:type': '',
            'og:image': '',
            'og:url': ''
        };

        this.optionalFields = {
            'og:audio': '',
            'og:description': '',
            'og:determiner': '',
            'og:locale': 'fr_FR',
            'og:locale:alternate': '',
            'og:site_name': '',
            'og:video': ''
        };

        this.structuredFields = {
            'og:image:secure_url': '', //An alternate url to use if the webpage requires HTTPS
            'og:image:type': '', //A MIME type for this image.
            'og:image:width': '',
            'og:image:height': '',
            'og:image:alt': '',

            'og:video:secure_url': '',
            'og:video:type': '',
            'og:video:width': '',
            'og:video:height': '',

            'og:audio:secure_url': '',
            'og:audio:type': ''
        };

        this.inputs = {};

        this.init();
    }

    init() {
        this.container.innerHTML = '';

        const wrapper = Builder.div('ogp-editor');
        this.container.appendChild(wrapper);

        const formContainer = Builder.div('ogp-form');
        const previewContainerWrapper = Builder.div('ogp-preview-wrapper');

        this.previewContainer = Builder.pre('ogp-preview');
        previewContainerWrapper.appendChild(this.previewContainer);

        wrapper.appendChild(formContainer);
        wrapper.appendChild(previewContainerWrapper);

        this.buildFormSection(formContainer, 'Champs requis', this.requiredFields);
        this.buildFormSection(formContainer, 'Champs optionnels', this.optionalFields);
        this.buildFormSection(formContainer, 'Propriétés structurées (image, vidéo, audio)', this.structuredFields);

        this.updatePreview();
    }

    buildFormSection(container, sectionTitle, fields) {
        const section = Builder.accordion(sectionTitle);

        for (const key in fields) {
            const fieldWrapper = Builder.div('input-wrapper');

            //if contain image
            if (['og:image', 'og:image:secure_url'].includes(key)) {
                const image = new MediaBlock(
                    'image',
                    key,
                    fields[key],
                    {
                        description: key,
                        mimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
                        size: 'og:image',
                        compression_method: 'none',
                    },
                    (option) => {
                        fields[key] = option.getValue() || null //this is image id, modified on render
                        this.updatePreview();
                        this.doChange();
                    },
                );
                image.render(fieldWrapper);
            } else {
                const label = Builder.label(key);
                const input = Builder.input_text('', fields[key]);
                input.addEventListener('input', (e) => {
                    fields[key] = e.target.value;
                    this.doChange();
                    this.updatePreview();
                });
                this.inputs[key] = input;
                fieldWrapper.appendChild(label);
                fieldWrapper.appendChild(input);
            }

            section.accordeon_content.appendChild(fieldWrapper);
        }

        container.appendChild(section.accordeon);
    }

    updatePreview() {
        const lines = [];

        for (const key in this.requiredFields) {
            const value = this.requiredFields[key].trim();
            if (value !== '') {
                lines.push(this.buildMetaTag(key, value));
            }
        }

        for (const key in this.optionalFields) {
            const value = this.optionalFields[key].trim();
            if (value !== '') {
                if (key === 'og:locale:alternate') {
                    value.split(',').forEach(locale => {
                        lines.push(this.buildMetaTag(key, locale.trim()));
                    });
                } else {
                    lines.push(this.buildMetaTag(key, value));
                }
            }
        }

        for (const key in this.structuredFields) {
            const value = this.structuredFields[key].trim();
            if (value !== '') {
                lines.push(this.buildMetaTag(key, value));
            }
        }

        this.previewContainer.textContent = lines.join('\n');
    }

    buildMetaTag(property, value) {
        return `<meta property="${property}" content="${this.escapeHtml(value)}" />`;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    getOpenGraphHtml() {
        return this.previewContainer.textContent;
    }

    onChange(callback) {
        this.changeCallback = callback;
    }

    doChange() {
        if (this.changeCallback)
            this.changeCallback(this.getData());
    }

    getData() {
        const data = {};

        for (const key in this.inputs) {
            const value = this.inputs[key].value.trim();
            if (value !== '') {
                data[key] = value;
            }
        }

        return data;
    }

    loadData(data) {
        for (const key in data) {
            if (this.inputs[key]) {
                this.inputs[key].value = data[key];
                // Mise à jour des champs liés
                if (this.requiredFields[key] !== undefined) this.requiredFields[key] = data[key];
                if (this.optionalFields[key] !== undefined) this.optionalFields[key] = data[key];
                if (this.structuredFields[key] !== undefined) this.structuredFields[key] = data[key];
            }
        }
        this.updatePreview();
    }
}
