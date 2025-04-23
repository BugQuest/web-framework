export default class OptionManager {
    static _cache = new Map(); // Map<string, Map<string, {type, value}>>

    static async getOption(group, key) {
        // Check cache d'abord
        if (this._cache.has(group) && this._cache.get(group).has(key)) {
            return this._cache.get(group).get(key);
        }

        // Sinon fetch
        const res = await fetch(`/admin/options/get/${group}/${key}`);
        if (!res.ok) throw new Error(`Erreur chargement de l'option "${key}"`);

        const data = await res.json();

        // Met à jour le cache
        if (!this._cache.has(group)) this._cache.set(group, new Map());
        this._cache.get(group).set(key, data);

        return data;
    }

    static async getOptions(group) {
        if (this._cache.has(group)) {
            return Object.fromEntries(this._cache.get(group));
        }

        const res = await fetch(`/admin/options/get/${group}`);
        if (!res.ok) throw new Error(`Erreur chargement des options du groupe "${group}"`);

        const data = await res.json();

        // Stocke en cache sous forme de Map
        const groupMap = new Map(Object.entries(data));
        this._cache.set(group, groupMap);

        return data;
    }

    static async saveOption(option) {
        const group = option.group ?? null;
        const key = option.key ?? null;
        const type = option.type ?? null;
        const value = option.value ?? null;

        if (!group || !key || typeof type !== 'string')
            throw new Error('Paramètres invalides pour saveOption()');

        const url = `/admin/options/set/${group}/${key}`;
        const payload = {type, value};

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error(`Erreur HTTP ${res.status} : enregistrement de "${key}" échoué`);
        }

        const result = await res.json();

        // Mise à jour du cache
        if (!this._cache.has(group)) this._cache.set(group, new Map());
        this._cache.get(group).set(key, payload);

        return result;
    }

    static async saveOptions(group, options) {
        if (!Array.isArray(options))
            throw new Error('Les options doivent être un tableau');

        const filteredOptions = options.filter(opt =>
            typeof opt === 'object' &&
            typeof opt.type === 'string' &&
            'value' in opt
        );

        const res = await fetch(`/admin/options/set/${group}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filteredOptions)
        });

        if (!res.ok)
            throw new Error(`Erreur lors de l'enregistrement des options du groupe "${group}"`);

        const result = await res.json();

        // Mise à jour du cache
        const groupMap = this._cache.get(group) ?? new Map();
        Object.entries(result).forEach(([key, opt]) => {
            groupMap.set(key, opt);
        });
        this._cache.set(group, groupMap);

        return result;
    }

    static async deleteOption(group, key) {
        const res = await fetch(`/admin/options/delete/${group}/${key}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            throw new Error(`Erreur lors de la suppression de l'option "${key}"`);
        }

        const result = await res.json();

        // Retirer du cache
        if (this._cache.has(group)) {
            this._cache.get(group).delete(key);
        }

        return result;
    }
}
