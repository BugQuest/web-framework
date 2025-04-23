export default class OptionManager {
    static async loadGroup(group) {
        const res = await fetch(`/admin/options/get/${group}`);
        if (!res.ok) throw new Error(`Erreur chargement options du groupe "${group}"`);
        return await res.json();
    }

    static async saveOption(group, key, value) {
        const body = {
            key,
            value: JSON.stringify(value),
        };

        const res = await fetch(`/admin/options/set/${group}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            throw new Error(`Erreur lors de l'enregistrement de l'option "${key}"`);
        }

        return await res.json();
    }

    static async deleteOption(group, key) {
        const res = await fetch(`/admin/options/delete/${group}/${key}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            throw new Error(`Erreur lors de la suppression de l'option "${key}"`);
        }

        return await res.json();
    }
}
