import Builder from '@framework/js/services/Builder';
import ConfirmDialog from "@framework/js/services/ConfirmDialog";
import {Toast} from "@framework/js/services/Toast";
import {__} from '@framework/js/services/Translator';

export default class RobotsManager {
    constructor(element) {
        this.element = element;
        this.apiBase = '/admin/api/robots';
        this.entries = {}; // stocke les entrées chargées
        this.edit = null;
        this.oldUserAgent = null;
        this.modal = null;
    }

    async init() {
        await this.render();
        await this.fetchEntries();
    }

    async fetchEntries() {
        try {
            const response = await fetch(`${this.apiBase}/list`);
            const data = await response.json();
            if (data.success) {
                this.entries = data.entries;
                this.updateList();
            } else {
                throw new Error(data.message || 'Failed to fetch entries.');
            }
        } catch (error) {
            Toast.show(error.message, { type: 'danger', icon: '⚠️', duration: 5000, position: 'bottom-right', closable: true });
            console.error(error);
        }
    }

    async render() {
        this.list_el = Builder.createEl('div', 'robot-list');
        this.element.appendChild(this.list_el);
        this.footer_el = Builder.createEl('div', 'robot-footer');
        this.element.appendChild(this.footer_el);
        this.add_btn = Builder.createEl('button', 'robot-add', 'Ajouter une règle');
        this.add_btn.addEventListener('click', () => this.openModal());
        this.footer_el.appendChild(this.add_btn);
    }

    updateList() {
        this.list_el.innerHTML = '';
        for (const userAgent in this.entries) {
            const group = Builder.div('robot-group');
            group.appendChild(Builder.h3(`🤖 User-agent: ${userAgent}`, 'robot-title'));
            const rulesList = Builder.createEl('ul', 'robot-rules');
            rulesList.dataset.userAgent = userAgent;
            this.entries[userAgent].forEach((rule, index) => {
                rulesList.appendChild(this.createRuleItem(userAgent, index, rule[0], rule[1]));
            });
            group.appendChild(rulesList);
            this.list_el.appendChild(group);
        }
    }

    createRuleItem(userAgent, index, directive, value) {
        const li = Builder.createEl('li', 'robot-rule');
        li.dataset.userAgent = userAgent;
        li.dataset.index = index;

        li.appendChild(Builder.createEl("span", null, `${directive}: ${value}`));

        const editButton = Builder.createEl('div', 'robot-edit', '✏️');
        editButton.onclick = () => this.openModal({ userAgent, index, directive, value });
        li.appendChild(editButton);

        const deleteButton = Builder.createEl('div', 'robot-delete', '🗑️');
        deleteButton.onclick = () => this.deleteRule(userAgent, index);
        li.appendChild(deleteButton);

        return li;
    }

    async addRule() {
        const userAgent = this.input_user_agent.value || '*';
        const directive = this.input_directive.getValue();
        const value = this.input_value.value;

        if (!directive) {
            Toast.show('Directive obligatoire.', { type: 'warning', icon: '⚠️', duration: 5000, position: 'bottom-right', closable: true });
            return;
        }

        if (!this.entries[userAgent])
            this.entries[userAgent] = [];

        this.entries[userAgent].push([directive, value]);

        await this.saveEntries();
        await this.fetchEntries();
    }

    async editRule() {
        if (this.edit === null) return;

        const oldUserAgent = this.oldUserAgent;
        const userAgent = this.input_user_agent.value || '*';
        const directive = this.input_directive.getValue();
        const value = this.input_value.value;

        if (!directive) {
            Toast.show('Directive obligatoire.', { type: 'warning', icon: '⚠️', duration: 5000, position: 'bottom-right', closable: true });
            return;
        }

        if (!this.entries[oldUserAgent] || !this.entries[oldUserAgent][this.edit]) {
            Toast.show('Erreur d\'\u00e9dition.', { type: 'danger', icon: '⚠️', duration: 5000, position: 'bottom-right', closable: true });
            return;
        }

        this.entries[oldUserAgent].splice(this.edit, 1);
        if (this.entries[oldUserAgent].length === 0)
            delete this.entries[oldUserAgent];

        if (!this.entries[userAgent])
            this.entries[userAgent] = [];

        this.entries[userAgent].push([directive, value]);

        this.edit = null;
        this.oldUserAgent = null;

        await this.saveEntries();
        await this.fetchEntries();
    }

    async deleteRule(userAgent, index) {
        await ConfirmDialog.show(
            async () => {
                this.entries[userAgent].splice(index, 1);
                if (this.entries[userAgent].length === 0)
                    delete this.entries[userAgent];
                await this.saveEntries();
                await this.fetchEntries();
            },
            async () => null,
            {
                title: __('Supprimer cette règle', 'admin'),
                message: __('Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?', 'admin'),
                confirmText: __('Supprimer', 'admin'),
                cancelText: __('Annuler', 'admin'),
                confirmClass: 'button danger',
                cancelClass: 'button info',
            }
        );
    }

    async saveEntries() {
        try {
            const response = await fetch(`${this.apiBase}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.buildPayload()),
            });
            const data = await response.json();

            if (!data.success)
                throw new Error(data.message || 'Erreur lors de la sauvegarde.');

            Toast.show('Robots.txt sauvegardé avec succès.', { type: 'success', icon: '✅', duration: 4000, position: 'bottom-right', closable: true });
        } catch (error) {
            Toast.show(error.message, { type: 'danger', icon: '⚠️', duration: 5000, position: 'bottom-right', closable: true });
            console.error(error);
        }
    }

    buildPayload() {
        const payload = [];

        for (const userAgent in this.entries) {
            if (!userAgent) continue;
            this.entries[userAgent].forEach(([directive, value]) => {
                if (!directive) return;
                payload.push({
                    user_agent: userAgent.trim(),
                    directive: directive.trim(),
                    value: (value || '').trim() // jamais vide
                });
            });
        }

        return payload;
    }

    openModal({ userAgent = '', directive = '', value = '', index = null } = {}) {
        this.edit = index;
        this.oldUserAgent = userAgent || '*';

        if (!this.modal) {
            this.modal = Builder.modal(null, () => null, () => this.edit = null);
            document.body.appendChild(this.modal.element);

            const wrapper = Builder.div('container-form');
            this.modal.content.appendChild(wrapper);

            const form_body = Builder.div('form-body');
            wrapper.appendChild(form_body);

            const form_footer = Builder.div('form-footer');
            wrapper.appendChild(form_footer);

            const form_group_user_agent = Builder.div('form-group');
            const form_group_directive = Builder.div('form-group');
            const form_group_value = Builder.div('form-group');

            form_body.appendChild(form_group_user_agent);
            form_body.appendChild(form_group_directive);
            form_body.appendChild(form_group_value);

            this.input_user_agent = Builder.search(
                'User-agent',
                (value) => {
                    const userAgents = Object.keys(this.entries);

                    const filteredUserAgents = userAgents.filter((userAgent) => userAgent.toLowerCase().includes(value.toLowerCase()));
                    const results = {};
                    filteredUserAgents.forEach((userAgent) => {
                        results[userAgent] = userAgent;
                    });

                    this.input_user_agent.populate(results);
                },
                (item) => {
                    this.input_user_agent.setValue(item);
                },
                2,
                false,
                'fullw',
                );
            this.input_directive = Builder.select('Directive', [
                { value: 'Disallow', label: 'Disallow' },
                { value: 'Allow', label: 'Allow' },
                { value: 'Crawl-delay', label: 'Crawl-delay' },
                { value: 'Sitemap', label: 'Sitemap' },
                { value: 'Host', label: 'Host' },
            ]);
            this.input_value = Builder.input_text('Valeur', '', 'fullw');
            form_group_user_agent.appendChild(this.input_user_agent.element);
            form_group_directive.appendChild(this.input_directive.getElement());
            form_group_value.appendChild(this.input_value);

            this.btn = Builder.button('Valider', 'form-submit', () => {
                if (this.edit !== null)
                    this.editRule();
                else
                    this.addRule();
                this.modal.close();
            });

            form_footer.appendChild(this.btn);
        }

        this.input_user_agent.value = userAgent || '';
        this.input_directive.setValue(directive ?? null);
        this.input_value.value = value || '';
        this.modal.open();
    }
}
