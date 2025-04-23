import grapesjs from 'grapesjs';
import loadBasicBlocks from './blocks/index.js';
import CustomBlockType from './blocks/type/CustomBlockType.js';
import {Toast} from '@framework/js/services/Toast';
import {__} from '@framework/js/services/Translator';

export default class PageBuilder {
    constructor(element) {
        this.element = element;
        this.loadUrl = '/admin/api/page/load';
        this.saveUrl = '/admin/api/page/save';
        this.editor = null;
        this.id = element.dataset.id || null;
        this.theme = element.dataset.theme || 'default';
        this.blocks = {};

        try {
            this.blocks = JSON.parse(element.dataset.blocks);
        } catch (e) {
            console.error('Impossible de parser les blocs :', e);
        }
    }

    async initEditor() {
        if (!this.element) throw new Error('Element is not defined');

        const config = {
            container: this.element,
            fromElement: true,
            storageManager: false,
            canvas: {
                styles: [
                    this.theme !== 'default' ? this.theme : '/admin/assets/css/theme-default'
                ],
            }
        };

        const data = this.id ? await this.loadData() : null;

        if (data) {
            this.element.innerHTML = data.html || '';
            document.querySelector('#page-title').value = data.title || '';
            document.querySelector('#page-slug').value = data.slug || '';
        }

        this.editor = grapesjs.init(config);
        loadBasicBlocks(this.editor);

        await this.loadBlocks();

        if (data?.builder_data) {
            this.editor.loadProjectData(data.builder_data);
        }

        this.addSaveButton();
        this.addReloadStylesButton();
        if (data) this.reloadCanvasStyles();
    }

    async loadBlocks() {
        await this.registerCustomBlockType();

        await Object.values(this.blocks).forEach(async block => {
            this.editor.BlockManager.add(block.name, {
                label: block.label,
                category: block.category,
                content: {
                    type: 'custom-block',
                    attributes: {
                        'data-block-type': block.name
                    },
                    'custom-data': block.customData || {},
                },
            });
        });
    }


    generateTraitsFromCustomData(customData) {
        return Object.entries(customData).map(([key, def]) => {
            const trait = {
                name: key,
                label: def.label || key,
                default: def.default,
            };

            switch (def.type) {
                case 'string':
                case 'text':
                    trait.type = 'text';
                    break;
                case 'select':
                    trait.type = 'select';
                    trait.options = Object.entries(def.options || {}).map(([value, name]) => ({value, name}));
                    break;
                case 'boolean':
                    trait.type = 'checkbox';
                    break;
                case 'number':
                    trait.type = 'number';
                    break;
                default:
                    trait.type = def.type || 'text';
            }

            return trait;
        });
    }

    async registerCustomBlockType() {
        await new CustomBlockType(this).register();
    }


    reloadCanvasStyles() {
        const iframeDoc = this.editor.Canvas.getDocument();
        const links = iframeDoc.querySelectorAll('link[rel="stylesheet"]');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
                const newHref = href.split('?')[0] + '?reload=' + new Date().getTime();
                link.setAttribute('href', newHref);
            }
        });

        Toast.show(__('Styles rechargés', 'admin'), {
            type: 'success',
            icon: '✅',
            duration: 2000,
            position: 'bottom-right',
            closable: true
        });
    }

    addSaveButton() {
        const panels = this.editor.Panels;

        panels.addButton('options', [{
            id: 'save-to-db',
            className: 'fa fa-save',
            command: 'save-to-db',
            attributes: {title: 'Enregistrer la page'}
        }]);

        this.editor.Commands.add('save-to-db', {
            run: () => this.saveData()
        });
    }

    addReloadStylesButton() {
        const panels = this.editor.Panels;

        panels.addButton('options', [{
            id: 'reload-styles',
            className: 'fa fa-refresh',
            command: 'reload-styles',
            attributes: {title: 'Recharger les styles'}
        }]);

        this.editor.Commands.add('reload-styles', {
            run: () => this.reloadCanvasStyles()
        });
    }

    async loadData() {
        try {
            const url = new URL(this.loadUrl + (this.id ? `/${this.id}` : ''), window.location.origin);
            const params = new URLSearchParams(window.location.search);
            url.search = params;

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {'Accept': 'application/json'},
            });

            if (!response.ok) throw new Error('Erreur HTTP');
            return await response.json();
        } catch (error) {
            Toast.show(__('Erreur lors du chargement de la page: ' + error.message, 'admin'), {
                type: 'error',
                icon: '❌',
                duration: 2000,
                position: 'bottom-right',
                closable: true
            });
            return null;
        }
    }

    async saveData() {
        const title = document.querySelector('#page-title')?.value || 'Page sans titre';
        const slug = document.querySelector('#page-slug')?.value || '';
        const html = this.editor.getHtml();
        const css = this.editor.getCss();
        const builderData = this.editor.getProjectData();

        const payload = {
            slug: slug,
            title: title,
            html: `${html}<style>${css}</style>`,
            builder_data: builderData
        };

        try {
            const response = await fetch(this.saveUrl + (this.id ? `/${this.id}` : ''), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                if (data && data.id) {
                    this.id = data.id;
                    const url = new URL(window.location.href);
                    url.pathname = `/admin/page/${data.id}`;
                    window.history.pushState({}, '', url);
                    document.querySelector('#page-title').value = data.title || '';
                    document.querySelector('#page-slug').value = data.slug || '';
                }

                Toast.show(__('page mise à jour', 'admin'), {
                    type: 'success',
                    icon: '✅',
                    duration: 2000,
                    position: 'bottom-right',
                    closable: true
                });
            } else {
                Toast.show(__('Erreur lors de la mise à jour de la page', 'admin'), {
                    type: 'error',
                    icon: '❌',
                    duration: 2000,
                    position: 'bottom-right',
                    closable: true
                });
            }
        } catch (error) {
            Toast.show(__('Erreur lors de la mise à jour de la page: ' + error.message, 'admin'), {
                type: 'error',
                icon: '❌',
                duration: 2000,
                position: 'bottom-right',
                closable: true
            });
        }
    }
}