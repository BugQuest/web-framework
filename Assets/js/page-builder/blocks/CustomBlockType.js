export default class CustomBlockType {
    constructor(pageBuilder) {
        this.pageBuilder = pageBuilder;
        this.editor = pageBuilder.editor;
        this.blocks = pageBuilder.blocks;
        this.cache = new Map();
    }

    getCache(key) {
        return this.cache.get(key);
    }

    setCache(key, value) {
        this.cache.set(key, value);
    }

    hasCache(key) {
        return this.cache.has(key);
    }

    clearCache(key) {
        if (key)
            this.cache.delete(key);
        else
            this.cache.clear();
    }

    async register() {
        const __this = this;
        const editor = this.pageBuilder.editor;
        const blocks = this.pageBuilder.blocks;
        const domc = this.pageBuilder.editor.DomComponents;

        domc.addType('custom-block', {
            isComponent: el => el.hasAttribute && el.hasAttribute('data-block-type'),

            model: {
                defaults: {traits: []},

                init() {
                    const attributes = this.getAttributes();

                    // Générer un ID unique s'il n'existe pas déjà
                    if (!attributes['data-instance-id']) {
                        const uuid = this.generateUUID();
                        attributes['data-instance-id'] = uuid;
                        this.setAttributes(attributes); // Mettre à jour les attributs
                    }

                    const blockType = attributes['data-block-type'];
                    const def = blocks?.[blockType];
                    if (!def) return;

                    const traits = def.customData ? this.generateTraits(def.customData) : [];
                    this.set('traits', traits);

                    traits.forEach(trait => {
                        if (trait.default !== undefined && !this.get(trait.name)) {
                            this.set(trait.name, trait.default);
                        }

                        this.on('change:attributes:' + trait.name, () => {
                            const attributes = this.getAttributes();
                            const instanceId = attributes['data-instance-id']
                            const payload = this.getPayload(attributes, def.customData);
                            const cacheKey = `${blockType}:${instanceId}:${JSON.stringify(payload)}`;
                            if (__this.hasCache(cacheKey))
                                __this.clearCache(cacheKey);
                            this.updatePreview();
                        });
                    });

                    // this.updatePreview();
                },

                generateUUID() {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        const r = Math.random() * 16 | 0;
                        const v = c === 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                },

                generateTraits(customData) {
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
                                trait.options = Object.entries(def.options || {}).map(([value, name]) => ({
                                    value,
                                    name
                                }));
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
                },

                getPayload(attributes, customData) {
                    const payload = {};
                    Object.keys(customData).forEach(key => {
                        let value = attributes[key] || this.get(key);
                        if ((value === undefined || value === null || value === '') && customData[key].default !== undefined) {
                            value = customData[key].default;
                        }
                        payload[key] = value;
                    });
                    return payload;
                },

                updatePreview() {
                    const model = this;
                    const view = model.view;
                    const attributes = model.getAttributes();
                    const instanceId = attributes['data-instance-id'];
                    const blockType = attributes['data-block-type'];
                    const def = blocks?.[blockType];
                    if (!def) return;

                    console.log(instanceId);

                    const payload = this.getPayload(attributes, def.customData);
                    const cacheKey = `${blockType}:${instanceId}:${JSON.stringify(payload)}`;

                    if (view?.el) {
                        view.el.innerHTML = '<div class="bq-block-loading">Chargement...</div>';

                        if (__this.hasCache(cacheKey)) {
                            view.el.innerHTML = __this.getCache(cacheKey);
                            return;
                        }
                    }

                    fetch(`/admin/api/page/block/render/${blockType}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify(payload)
                    })
                        .then(r => {
                            if (!r.ok) throw new Error(`Erreur HTTP ${r.status}`);
                            return r.text();
                        })
                        .then(html => {
                            if (view?.el) {
                                view.el.innerHTML = html || `<div class="bq-block-empty">[Aucun rendu]</div>`;
                                __this.setCache(cacheKey, html);
                            }
                        })
                        .catch(err => {
                            console.warn(`Erreur de rendu dynamique (${blockType}) :`, err);
                        });
                }
            },

            view: {
                onRender() {
                    this.model.updatePreview();
                }
            }
        });
    }
}
