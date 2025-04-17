import {Toast} from "./Toast";

export default class Translator {
    static _domains = {};
    static _loaded = {};

    static async load(domain) {
        if (this._loaded[domain]) return;
        try {
            const response = await fetch(`/admin/locale/domain/get/${domain}`);
            if (!response.ok) throw new Error(`Erreur lors du chargement du domaine ${domain}`);
            const data = await response.json();
            this._domains[domain] = data;
            this._loaded[domain] = true;
        } catch (error) {
            Toast.show(error.message,
                {
                    type: 'danger',
                    icon: '⚠️',
                    duration: 5000,
                    position: 'bottom-right',
                    closable: true
                })
            console.error(`[Translator] ${error.message}`);
        }
    }

    static async translate(key, domain = 'bugquest', replacements = {}) {
        if (!this._loaded[domain])
            await this.load(domain);

        let translation = this._domains[domain]?.[key] ?? key;
        return this._applyReplacements(translation, replacements);
    }

    static t(key, domain = 'bugquest', replacements = {}) {
        let translation = this._domains[domain]?.[key] ?? key;
        return this._applyReplacements(translation, replacements);
    }

    static _applyReplacements(str, replacements) {
        return str.replace(/{(.*?)}/g, (match, token) => {
            return replacements[token] ?? match;
        });
    }
}
