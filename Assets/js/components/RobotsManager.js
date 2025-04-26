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
            Toast.show(error.message, {
                type: 'danger',
                icon: '⚠️',
                duration: 5000,
                position: 'bottom-right',
                closable: true
            });
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

            group.appendChild(Builder.h3(`User-agent: ${userAgent}`, 'robot-title'));

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
        editButton.onclick = () => this.openModal({userAgent, index, directive, value});
        li.appendChild(editButton);

        const deleteButton = Builder.createEl('div', 'robot-delete', '🗑️');
        deleteButton.onclick = () => this.deleteRule(userAgent, index);
        li.appendChild(deleteButton);

        return li;
    }

    async addRule() {

        const userAgent = this.input_user_agent.value;
        const directive = this.input_directive.value;
        const value = this.input_value.value;

        if (!directive) return;

        try {
            const response = await fetch(`${this.apiBase}/add`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({user_agent: userAgent, directive, value}),
            });
            const data = await response.json();

            if (data.success) {
                await this.fetchEntries();
                this.updateList();
            } else {
                throw new Error(data.message || 'Erreur lors de l’ajout.');
            }
        } catch (error) {
            Toast.show(error.message, {
                type: 'danger',
                icon: '⚠️',
                duration: 5000,
                position: 'bottom-right',
                closable: true
            });
            console.error(error);
        }
    }

    async editRule() {
        if (this.edit === null) return;

        const userAgent = this.input_user_agent.value;
        const directive = this.input_directive.value;
        const value = this.input_value.value;

        if (!directive) return;

        try {
            const response = await fetch(`${this.apiBase}/edit`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({user_agent: userAgent, index: this.edit, directive, value}),
            });
            this.edit = null;

            const data = await response.json();

            if (data.success) {
                await this.fetchEntries();
                this.updateList();
            } else {
                throw new Error(data.message || 'Erreur lors de la modification.');
            }
        } catch (error) {
            Toast.show(error.message, {
                type: 'danger',
                icon: '⚠️',
                duration: 5000,
                position: 'bottom-right',
                closable: true
            });
            console.error(error);
        }
    }

    async deleteRule(userAgent, index) {
        await ConfirmDialog.show(
            async () => {
                try {
                    const response = await fetch(`${this.apiBase}/delete`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({user_agent: userAgent, index}),
                    });
                    const data = await response.json();

                    if (data.success) {
                        await this.fetchEntries();
                        this.updateList();
                    } else {
                        throw new Error(data.message || 'Erreur lors de la suppression.');
                    }
                } catch (error) {
                    Toast.show(error.message, {
                        type: 'danger',
                        icon: '⚠️',
                        duration: 5000,
                        position: 'bottom-right',
                        closable: true
                    })
                    console.error(error);
                }
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
        )
    }

    openModal({ userAgent = '', directive = '', value = '', index = null } = {}) {
        this.edit = index;
        if (!this.modal) {
            this.modal = Builder.modal(
                null,
                () => null,
                () => this.edit = null,
            );
            document.body.appendChild(this.modal.element);

            const wrapper = Builder.div('container-form');
            this.modal.content.appendChild(wrapper);

            const form_header = Builder.div('form-header');
            wrapper.appendChild(form_header);

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

            this.input_user_agent = Builder.input_text('User-agent', '', 'fullw');
            this.input_directive = Builder.input_text('Directive', '', 'fullw');
            this.input_value = Builder.input_text('Valeur', '', 'fullw');

            form_group_user_agent.appendChild(this.input_user_agent);
            form_group_directive.appendChild(this.input_directive);
            form_group_value.appendChild(this.input_value);

            this.btn = Builder.button('Valider', 'form-submit', () => {
                if (this.edit)
                    this.editRule();
                else
                    this.addRule();

                this.modal.close();
            });

            form_footer.appendChild(this.btn);
        }

        this.input_user_agent.value = userAgent || '';
        this.input_directive.value = directive || '';
        this.input_value.value = value || '';
        this.modal.open();
        this.input_user_agent.focus();
        this.input_user_agent.focus();
    }
}