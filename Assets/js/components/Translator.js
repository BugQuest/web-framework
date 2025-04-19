export class Translator {
    static _domains = {};
    static _loaded = {};

    static async load(domain) {
        if (this._loaded[domain]) return;

        try {
            const response = await fetch(`/admin/api/locale/domain/get/${domain}`);
            if (!response.ok) throw new Error(`Error for domain: ${domain}`);
            const data = await response.json();
            this._domains[domain] = data;
            this._loaded[domain] = true;
            return data;
        } catch (error) {
            console.error(`[Translator] ${error.message}`);
        }

        return null;
    }

    static async translate(key, domain = 'bugquest', replacements = {}) {
        domain = domain.trim();
        key = key.trim();
        if (!this._loaded[domain]) await this.load(domain);

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

export function __(key, domain = 'bugquest', replacements = {}) {
    return Translator.t(key, domain, replacements);
}
