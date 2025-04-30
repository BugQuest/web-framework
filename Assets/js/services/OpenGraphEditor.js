import Builder from '@framework/js/services/Builder.js';
import {MediaBlock} from '@framework/js/options/MediaBlock';
import {LazySmooth} from '@framework/js/services/LazySmooth.js';

export default class OpenGraphEditor {
    constructor(container) {
        this.container = container;
        this.inputs = {};
        this.currentValues = {};
        this.selectedType = 'website';

        this.og_types = {
            'website': {
                'og:type': {
                    type: 'hidden',
                    default: 'website',
                },
                'og:url': {
                    type: 'url',
                    default: '',
                },
                'og:title': {
                    type: 'text',
                    default: '',
                },
                'og:description': {
                    type: 'textarea',
                    default: '',
                },
                'og:image': {
                    type: 'image',
                    default: '',
                },
                'og:locale': {
                    type: 'text',
                    default: 'fr_FR',
                },
                'og:site_name': {
                    type: 'text',
                    default: '',
                },
            },
            'article': {
                'og:type': {
                    type: 'hidden',
                    default: 'article',
                },
                'og:url': {
                    type: 'url',
                    default: '',
                },
                'og:title': {
                    type: 'text',
                    default: '',
                },
                'og:description': {
                    type: 'textarea',
                    default: '',
                },
                'og:image': {
                    type: 'image',
                    default: '',
                },
                'og:locale': {
                    type: 'text',
                    default: 'fr_FR',
                },
                'article:author': {
                    type: 'text',
                    default: '',
                },
                'article:published_time': {
                    type: 'datetime', //2025-04-24T20:30+02:00
                    default: '',
                },
                'article:modified_time': {
                    type: 'datetime', //2025-04-24T20:30+02:00
                    default: '',
                },
                'article:expiration_time': {
                    type: 'datetime', //2025-04-24T20:30+02:00
                    default: '',
                },
                'article:section': {
                    type: 'text',
                    default: '',
                },
                'article:tag': {
                    type: 'keywords', //use Builder.keywords
                    default: '',
                },
            },
            'book': {
                'og:type': {
                    type: 'hidden',
                    default: 'book',
                },
                'og:url': {
                    type: 'url',
                    default: '',
                },
                'og:title': {
                    type: 'text',
                    default: '',
                },
                'og:description': {
                    type: 'textarea',
                    default: '',
                },
                'og:image': {
                    type: 'image',
                    default: '',
                },
                'og:locale': {
                    type: 'text',
                    default: 'fr_FR',
                },
                'book:isbn': {
                    type: 'text',
                    default: '',
                },
                'book:author': {
                    type: 'text',
                    default: '',
                },
                'book:release_date': {
                    type: 'datetime', //2025-04-24T20:30+02:00
                    default: '',
                },
                'book:tag': {
                    type: 'keywords', //use Builder.keywords
                    default: '',
                },
            },
            'business.business': {
                'og:type': {
                    type: 'hidden',
                    default: 'business.business',
                },
                'og:url': {
                    type: 'url',
                    default: '',
                },
                'og:title': {
                    type: 'text',
                    default: '',
                },
                'og:description': {
                    type: 'textarea',
                    default: '',
                },
                'og:image': {
                    type: 'image',
                    default: '',
                },
                'og:locale': {
                    type: 'text',
                    default: 'fr_FR',
                },
                'business:street_address': {
                    type: 'text',
                    default: '',
                },
                'business:locality': { //City
                    type: 'text',
                    default: '',
                },
                'business:region': { //State
                    type: 'text',
                    default: '',
                },
                'business:postal_code': {
                    type: 'text',
                    default: '',
                },
                'business:country_name': {
                    type: 'text',
                    default: '',
                },
            },
            'music.album': {
                'og:type': {
                    type: 'hidden',
                    default: 'music.album',
                },
                'og:url': {
                    type: 'url',
                    default: '',
                },
                'og:title': {
                    type: 'text',
                    default: '',
                },
                'og:description': {
                    type: 'textarea',
                    default: '',
                },
                'og:image': {
                    type: 'image',
                    default: '',
                },
                'og:locale': {
                    type: 'text',
                    default: 'fr_FR',
                },
                'music:song': {
                    type: 'keywords',
                    default: '',
                },
                'music:musician': {
                    type: 'keywords',
                    default: '',
                },
                'music:release_date': {
                    type: 'datetime', //2025-04-24T20:30+02:00
                    default: '',
                },
            },
            'music.playlist': {
                'og:type': {
                    type: 'hidden',
                    default: 'music.playlist',
                },
                'og:url': {
                    type: 'url',
                    default: '',
                },
                'og:title': {
                    type: 'text',
                    default: '',
                },
                'og:description': {
                    type: 'textarea',
                    default: '',
                },
                'og:image': {
                    type: 'image',
                    default: '',
                },
                'og:locale': {
                    type: 'text',
                    default: 'fr_FR',
                },
                'music:song': {
                    type: 'keywords',
                    default: '',
                },
                'music:creator': {
                    type: 'keywords',
                    default: '',
                },
            },
            'music.song': {
                'og:type': {
                    type: 'hidden',
                    default: 'music.song',
                },
                'og:url': {
                    type: 'url',
                    default: '',
                },
                'og:title': {
                    type: 'text',
                    default: '',
                },
                'og:description': {
                    type: 'textarea',
                    default: '',
                },
                'og:image': {
                    type: 'image',
                    default: '',
                },
                'og:locale': {
                    type: 'text',
                    default: 'fr_FR',
                },
                'og:audio': {
                    type: 'url',
                    default: 'fr_FR',
                },
                'music:album': {
                    type: 'url',
                    default: '',
                },
                'music:duration': {
                    type: 'integer', //in seconds
                    default: '',
                },
                'music:musician': {
                    type: 'keywords',
                    default: '',
                }
            },
            'product': {
                'og:type': {
                    type: 'hidden',
                    default: 'product',
                },
                'og:url': {
                    type: 'url',
                    default: '',
                },
                'og:title': {
                    type: 'text',
                    default: '',
                },
                'og:description': {
                    type: 'textarea',
                    default: '',
                },
                'og:image': {
                    type: 'image',
                    default: '',
                },
                'og:locale': {
                    type: 'text',
                    default: 'fr_FR',
                },
                'product:plural_title': {
                    type: 'text',
                    default: '',
                },
                'product:price:amount': {
                    type: 'float', //in cents
                    default: '',
                },
                'product:price:currency': {
                    type: 'text', //ISO 4217
                    default: '',
                },
            },
            'profile': {
                'og:type': {
                    type: 'hidden',
                    default: 'profile',
                },
                'og:url': {
                    type: 'url',
                    default: '',
                },
                'og:title': {
                    type: 'text',
                    default: '',
                },
                'og:description': {
                    type: 'textarea',
                    default: '',
                },
                'og:image': {
                    type: 'image',
                    default: '',
                },
                'og:locale': {
                    type: 'text',
                    default: 'fr_FR',
                },
                'profile:first_name': {
                    type: 'text',
                    default: '',
                },
                'profile:last_name': {
                    type: 'text',
                    default: '',
                },
                'profile:username': {
                    type: 'text',
                    default: '',
                }
            },
            'video': {
                'og:type': {
                    type: 'select',
                    default: 'video.movie',
                    options: [
                        {value: 'video.movie', label: 'Movie'},
                        {value: 'video.episode', label: 'Episode'},
                        {value: 'video.tv_show', label: 'TV Show'},
                        {value: 'video.other', label: 'Other'},
                    ],
                },
                'og:url': {
                    type: 'url',
                    default: '',
                },
                'og:title': {
                    type: 'text',
                    default: '',
                },
                'og:description': {
                    type: 'textarea',
                    default: '',
                },
                'og:image': {
                    type: 'image',
                    default: '',
                },
                'og:locale': {
                    type: 'text',
                    default: 'fr_FR',
                },
                'video:duration': {
                    type: 'integer', //in seconds
                    default: '',
                },
                'video:release_date': {
                    type: 'datetime', //2025-04-24T20:30+02:00
                    default: '',
                },
                'video:tag': {
                    type: 'keywords',
                    default: '',
                },
                'video:actor': {
                    type: 'keywords',
                    default: '',
                },
                'video:director': {
                    type: 'keywords',
                    default: '',
                },
                'video:writer': {
                    type: 'keywords',
                    default: '',
                },
            },
        }

        this.og_description = {
            'og:url': 'URL canonique de la page',
            'og:title': 'Titre de la page à afficher',
            'og:description': 'Description synthétique de la page',
            'og:image': 'Image représentative (1200x630 recommandé)',
            'og:locale': 'Langue de la page (ex : fr_FR)',
            'og:site_name': 'Nom de ton site',
            'article:author': 'Nom de l’auteur de l’article',
            'article:published_time': 'Date de publication (ISO 8601)',
            'article:modified_time': 'Date de modification (ISO 8601)',
            'article:expiration_time': 'Date d’expiration (ISO 8601)',
            'article:section': 'Section thématique (ex : Politique)',
            'article:tag': 'Mots-clés de l’article',
            'book:isbn': 'Numéro ISBN',
            'book:author': 'Auteur du livre',
            'book:release_date': 'Date de sortie du livre',
            'book:tag': 'Mots-clés du livre',
            'business:street_address': 'Adresse (rue et n°)',
            'business:locality': 'Ville',
            'business:region': 'Région ou État',
            'business:postal_code': 'Code postal',
            'business:country_name': 'Nom du pays',
            'music:song': 'Titres présents (séparés par virgule)',
            'music:musician': 'Musiciens (séparés par virgule)',
            'music:creator': 'Créateur de la playlist',
            'music:release_date': 'Date de sortie',
            'og:audio': 'URL du fichier audio',
            'music:album': 'URL de l’album',
            'music:duration': 'Durée en secondes',
            'product:plural_title': 'Titre générique pour plusieurs produits',
            'product:price:amount': 'Prix (ex : 12.99)',
            'product:price:currency': 'Devise ISO 4217 (ex : EUR)',
            'profile:first_name': 'Prénom',
            'profile:last_name': 'Nom',
            'profile:username': 'Nom d’utilisateur',
            'video:duration': 'Durée en secondes',
            'video:release_date': 'Date de sortie de la vidéo',
            'video:tag': 'Mots-clés',
            'video:actor': 'Acteurs',
            'video:director': 'Réalisateur(s)',
            'video:writer': 'Scénariste(s)',
            'og:type': 'Type de contenu (ex : video.movie)',
        };

        this.init();
    }

    init() {
        this.container.innerHTML = '';
        const wrapper = Builder.div('ogp-editor');
        this.container.appendChild(wrapper);

        const formContainer = Builder.div('ogp-form');
        this.formContainer = formContainer;

        const previewContainerWrapper = Builder.div('ogp-preview-wrapper');
        this.previewContainer = Builder.pre('ogp-preview');
        previewContainerWrapper.appendChild(this.previewContainer);

        const typeSelector = Builder.select('Type OpenGraph', Object.keys(this.og_types), this.selectedType, (type) => {
            this.selectedType = type;
            this.buildDynamicForm();
            this.updatePreview();
        });

        formContainer.appendChild(typeSelector.getElement());
        wrapper.appendChild(formContainer);
        wrapper.appendChild(previewContainerWrapper);

        this.buildDynamicForm();
        this.updatePreview();
    }

    buildDynamicForm() {
        // Efface tout sauf le select
        this.formContainer.querySelectorAll('.input-wrapper, .accordion').forEach(el => el.remove());
        this.inputs = {};
        this.currentValues = {};

        const fields = this.og_types[this.selectedType] || {};

        for (const key in fields) {
            const {type, default: defaultValue, options} = fields[key];
            const description = this.og_description[key] || key;

            const fieldWrapper = Builder.div('input-wrapper');
            const label = Builder.label(description);

            let input = null;

            switch (type) {
                case 'hidden':
                    input = Builder.input_hidden(key, defaultValue);
                    this.currentValues[key] = defaultValue;
                    break;
                case 'image':
                    const image = new MediaBlock(
                        'image',
                        key,
                        defaultValue,
                        {
                            description,
                            mimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
                            size: 'og:image',
                            compression_method: 'none',
                        },
                        (option) => {
                            this.currentValues[key] = option.getValue();
                            this.updatePreview();
                            this.doChange();
                        }
                    );
                    image.render(fieldWrapper);
                    this.inputs[key] = image;
                    break;
                case 'keywords':
                    const keywords = Builder.keywords(key, '', defaultValue === '' ? null : defaultValue.split(','), (values) => {
                        this.currentValues[key] = values.join(',');
                        this.updatePreview();
                        this.doChange();
                    });
                    keywords.getElement().dataset.lazySmooth = '';
                    fieldWrapper.appendChild(label);
                    fieldWrapper.appendChild(keywords.getElement());
                    break;
                case 'datetime':
                    //@todo: use datetimepicker
                    input = Builder.input_text('', defaultValue);
                    input.setAttribute('placeholder', '2025-04-24T20:30+02:00');
                    input.setAttribute('maxlength', 25);
                    input.setAttribute('autocomplete', 'off');
                    break;
                case 'url':
                    input = Builder.input_text('', defaultValue);
                    input.setAttribute('placeholder', 'https://www.example.com');
                    input.setAttribute('maxlength', 255);
                    input.setAttribute('autocomplete', 'off');
                    input.setAttribute('pattern', 'https?://.+');
                    break;
                case 'textarea':
                    input = Builder.textarea('', defaultValue);
                    input.setAttribute('maxlength', 300);
                    input.setAttribute('rows', 3);
                    input.setAttribute('placeholder', '300 caractères max');
                    break;
                case 'integer':
                    input = Builder.input_number('', 1, defaultValue);
                    break;
                case 'float':
                    input = Builder.input_number('', 0.01, defaultValue);
                    break;
                case 'select':
                    const select = Builder.select(key, options, defaultValue, (value) => {
                        this.currentValues[key] = value;
                        this.updatePreview();
                        this.doChange();
                    });
                    fieldWrapper.appendChild(label);
                    fieldWrapper.appendChild(select.getElement());
                    break;
                case 'text':
                default:
                    input = Builder.input_text('', defaultValue);
                    break;
            }

            if (input) {
                this.inputs[key] = input;
                input.dataset.lazySmooth = '';
                input.addEventListener('input', (e) => {
                    this.currentValues[key] = e.target.value;
                    this.updatePreview();
                    this.doChange();
                });
                input.value = defaultValue;
                label.dataset.lazySmooth = '';
                fieldWrapper.appendChild(label);
                fieldWrapper.appendChild(input);
            }

            this.formContainer.appendChild(fieldWrapper);
            this.currentValues[key] = defaultValue;
        }

        LazySmooth.process();
    }

    updatePreview() {
        const lines = [];
        for (const key in this.currentValues) {
            const value = this.currentValues[key]?.trim?.();
            if (value) {
                if (key === 'og:locale:alternate') {
                    value.split(',').forEach(locale => {
                        lines.push(this.buildMetaTag(key, locale.trim()));
                    });
                } else {
                    lines.push(this.buildMetaTag(key, value));
                }
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

    onChange(callback) {
        this.changeCallback = callback;
    }

    doChange() {
        if (this.changeCallback)
            this.changeCallback(this.getData());
    }

    getData() {
        return {...this.currentValues};
    }

    loadData(data) {
        for (const key in data) {
            if (this.inputs[key]) {
                this.inputs[key].value = data[key];
                this.currentValues[key] = data[key];
            }
        }
        this.updatePreview();
    }

    getOpenGraphHtml() {
        return this.previewContainer.textContent;
    }
}
