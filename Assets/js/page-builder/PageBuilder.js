import grapesjs from 'grapesjs';
import loadBasicBlocks from './blocks/index.js';

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
            });
            loadBasicBlocks(this.editor);
            return;
        }

        const data = await this.loadData();

        if (!data) {
            console.error('Impossible de charger les données de la page');
            return;
        }

        this.element.innerHTML = data.html || '';

        this.editor = grapesjs.init({
            container: this.element,
            fromElement: true,
            storageManager: false,
        });
        loadBasicBlocks(this.editor);
        if (data.builder_data) {
            this.editor.loadProjectData(data.builder_data);
        }

        this.addSaveButton();
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

    async loadData() {
        try {
            const url = new URL(this.loadUrl, window.location.origin);
            const params = new URLSearchParams(window.location.search); // ex: ?id=5
            url.search = params;

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {'Accept': 'application/json'},
            });

            if (!response.ok) throw new Error('Erreur HTTP');

            return await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des données :', error);
            return null;
        }
    }

    async saveData() {
        const html = this.editor.getHtml();
        const css = this.editor.getCss();
        const builderData = this.editor.getProjectData();

        const payload = {
            html: `${html}<style>${css}</style>`,
            builder_data: builderData
        };

        try {
            const response = await fetch(this.saveUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Page enregistrée avec succès !');
            } else {
                alert('Erreur lors de la sauvegarde.');
            }
        } catch (error) {
            console.error('Erreur de sauvegarde :', error);
            alert('Erreur réseau.');
        }
    }
}
