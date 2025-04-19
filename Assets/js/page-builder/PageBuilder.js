import grapesjs from 'grapesjs';
import loadBasicBlocks from './blocks/index.js';
import {Toast} from "@framework/js/components/Toast";
import {__} from "@framework/js/components/Translator";

export default class PageBuilder {
    constructor(element) {
        this.element = element;
        this.loadUrl = '/admin/api/page/load';
        this.saveUrl = '/admin/api/page/save';
        this.editor = null;
        this.id = element.dataset.id || null;
    }

    async initEditor() {
        if (!this.element)
            throw new Error('Element is not defined');

        if (!this.id) {
            this.editor = grapesjs.init({
                container: this.element,
                fromElement: true,
                storageManager: false,
                canvas: {
                    styles: [
                        '/framework/assets/css/theme-default'
                    ],
                }
            });
            loadBasicBlocks(this.editor);
            this.addSaveButton();
            this.addReloadStylesButton();
            return;
        }

        const data = await this.loadData();

        if (!data) {
            console.error('Impossible de charger les données de la page');
            Toast.show(__('Impossible de charger les données de la page', 'admin'), {
                type: 'error',
                icon: '❌',
                duration: 2000,
                position: 'bottom-right',
                closable: true
            });
            return;
        }

        this.element.innerHTML = data.html || '';

        document.querySelector('#page-title').value = data.title || '';
        document.querySelector('#page-slug').value = data.slug || '';

        this.editor = grapesjs.init({
            container: this.element,
            fromElement: true,
            storageManager: false,
            canvas: {
                styles: [
                    '/admin/assets/css/theme-default'
                ],
            }
        });
        loadBasicBlocks(this.editor);
        if (data.builder_data)
            this.editor.loadProjectData(data.builder_data);


        this.addSaveButton();
        this.addReloadStylesButton();
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

        console.log('[GrapesJS] Styles rechargés via shortcut.');
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

    addPageTitleInput() {

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
            const params = new URLSearchParams(window.location.search); // ex: ?id=5
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
                    //update title
                    document.querySelector('#page-title').value = data.title || '';
                    document.querySelector('#page-slug').value = data.slug || '';
                }


                Toast.show(__('page mise à jour', 'admin'), {
                    type: 'success',
                    icon: '✅',
                    duration: 2000,
                    position: 'bottom-right',
                    closable: true
                })
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
            console.error('Erreur de sauvegarde :', error);
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
