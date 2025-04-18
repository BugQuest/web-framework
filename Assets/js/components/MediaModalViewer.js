import BuildHelper from "./BuildHelper";
import ConfirmDialog from "./ConfirmDialog";
import {Toast} from "./Toast";
import {__} from './Translator.js';

export default class MediaModalViewer {
    constructor(gallery) {
        this.gallery = gallery;
        this.waitingTags = [];
        this.deletionMode = false;
        this.new_tag = '';

        const {modal, content, close} = BuildHelper.modal(null, () => {
            this.gallery.loadPage();
            this.waitingTags = [];
            this.deletionMode = false;
            content.innerHTML = '';
        });

        this.modal = modal;
        this.modal_content = content;
        document.body.appendChild(this.modal);
    }

    async open(media) {
        if (!media) return;

        this.waitingTags = media.tags ? JSON.parse(JSON.stringify(media.tags)) : [];
        this.deletionMode = false;
        this.modal_content.innerHTML = '';

        const container = BuildHelper.div('media-modal');

        container.appendChild(this.buildActions(media));
        container.appendChild(this.buildPreview(media));

        const info = BuildHelper.div('media-modal--info');
        const infoContainer = BuildHelper.div('media-modal--info-container');

        const title = BuildHelper.h2(media.original_name);
        const infoSub = BuildHelper.div();
        const list = BuildHelper.list([`<strong>Type :</strong> ${media.mime_type}`, `<strong>Taille :</strong> ${(media.size / 1024).toFixed(1)} ko`, `<strong>Extension :</strong> ${media.extension}`, `<strong>Ajouté le :</strong> ${new Date(media.created_at).toLocaleDateString('fr-FR')}`,]);

        infoSub.appendChild(title);
        infoSub.appendChild(list);
        infoContainer.appendChild(infoSub);

        infoContainer.appendChild(this.buildTagEditor(media));
        info.appendChild(infoContainer);

        if (media.exif && typeof media.exif === 'object' && Object.keys(media.exif).length > 0) {
            const {accordeon, accordeon_content} = BuildHelper.accordion('EXIF', 'small');
            const exifList = BuildHelper.list(Object.entries(media.exif).map(([key, value]) => `<strong>${key}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : value}`));
            exifList.classList.add('media-modal--exif');
            accordeon_content.appendChild(exifList);
            info.appendChild(accordeon);
        }

        container.appendChild(info);
        this.modal_content.appendChild(container);
        this.modal.classList.add('active');
    }

    buildTagUpdateButton(media) {
        const button = BuildHelper.div('icon info hidden');
        button.innerHTML = '💾';
        button.dataset.tooltip = __('Mettre à jour les tags', 'admin');
        button.dataset.tooltipType = 'info';

        button.onclick = async () => {

            let tagIds = this.waitingTags.map(tag => tag.id);

            const encoded = tagIds.map(id => `tags[]=${encodeURIComponent(id)}`).join('&');

            this.deletionMode = false;
            this.tagDeleteBtn.classList.remove('active');

            try {
                const res = await fetch(`${this.gallery.apiUrl}/tags/set/${media.id}`, {
                    method: 'POST', headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }, body: encoded
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                this.waitingTags.forEach(tag => {
                    if ("new" in tag && tag.new) delete tag.new;
                });
                media.tags = JSON.parse(JSON.stringify(this.waitingTags));
                this.updateTagList()
                this.updateTagButtonVisibility()
                Toast.show(__('Tags mis à jour', 'admin'), {
                    type: 'success', icon: '✅', duration: 2000, position: 'bottom-right', closable: true
                })

            } catch (err) {
                Toast.show('[MediaModalViewer] ' + __('Erreur mise à jour des tags :', 'admin') + ' ' + err.message, {
                    type: 'danger', icon: '⚠️', duration: 5000, position: 'bottom-right', closable: true
                })
                console.error('[MediaModalViewer] ' + __('Erreur mise à jour des tags :', 'admin'), err);
            }
        };

        return button;
    }

    buildTagDeleteToggle(media) {
        const button = BuildHelper.div('icon danger');
        button.innerHTML = '❌';
        button.dataset.tooltip = __('Mode suppression', 'admin');
        button.dataset.tooltipType = 'danger';

        button.onclick = () => {
            this.deletionMode = !this.deletionMode;

            //if close delete mode, reset tags to original and keep new tags at end
            if (!this.deletionMode) {
                const newTags = this.waitingTags.filter(tag => ("new" in tag && tag.new));
                this.waitingTags = media.tags ? JSON.parse(JSON.stringify(media.tags)) : [];
                this.waitingTags.push(...newTags);
                this.updateTagList();
                this.updateTagButtonVisibility()
            }

            button.classList.toggle('active', this.deletionMode);
        };

        return button;
    }

    buildAddCategoryButton(media) {
        const button = BuildHelper.div('icon hidden');
        button.innerHTML = '➕';
        button.dataset.tooltip = __('Ajouter une nouvelle catégorie', 'admin');
        button.dataset.tooltipType = 'info';

        button.onclick = async () => {

            if (!this.new_tag || this.new_tag.length < 3) return;

            //check if tag already exists
            const tagExists = this.gallery.tags.find(tag => tag.name.toLowerCase() === this.new_tag.toLowerCase());
            if (tagExists) return;

            try {
                const response = await fetch(`${this.gallery.apiUrl}/tags/add`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: 'name=' + encodeURIComponent(this.new_tag),
                });

                this.search.dispatchEvent(new Event('close'));
                this.new_tag = '';
                this.tagAddBtn.classList.add('hidden')

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const tag = await response.json();
                this.gallery.tags.push(tag);
                this.gallery.renderTags();
                tag.new = true;
                this.waitingTags.push(tag);
                this.updateTagList();
                this.updateTagButtonVisibility();
            } catch (err) {
                Toast.show('[MediaModalViewer] ' + __("Erreur d'ajout de tag :", 'admin') + ' ' + err.message, {
                    type: 'danger',
                    icon: '⚠️',
                    duration: 5000,
                    position: 'bottom-right',
                    closable: true
                })
                console.error('[MediaModalViewer] ' + __("Erreur d'ajout de tag :", 'admin'), err);
            }
        };

        return button;
    }

    buildTagEditor(media) {
        const tagsContainer = BuildHelper.div('media-modal--tags');
        const tagList = BuildHelper.div('media-modal--tags-list');
        const tagActions = BuildHelper.div('media-modal--tags-actions');

        this.tagUpdateBtn = this.buildTagUpdateButton(media);
        this.tagAddBtn = this.buildAddCategoryButton(media);
        this.tagDeleteBtn = this.buildTagDeleteToggle(media);
        tagActions.append(this.tagUpdateBtn, this.tagDeleteBtn, this.tagAddBtn);

        this.updateTagButtonVisibility = () => {
            //check if waintingTags is different from media.tags, ignore order, check only ids
            const waitingTagIds = this.waitingTags.map(tag => tag.id);
            const mediaTagIds = media.tags.map(tag => tag.id);
            const isDifferent = waitingTagIds.length !== mediaTagIds.length || waitingTagIds.some(id => !mediaTagIds.includes(id));

            if (isDifferent)
                this.tagUpdateBtn.classList.remove('hidden');
            else
                this.tagUpdateBtn.classList.add('hidden');
        };

        this.updateTagList = () => {
            tagList.innerHTML = '';
            this.waitingTags.forEach(tag => {
                const tagEl = BuildHelper.div('tag');
                tagEl.textContent = tag.name;
                tagEl.dataset.tag = tag.id;

                if (tag.new) {
                    tagEl.classList.add('new');
                    tagEl.dataset.tooltip = __('Cliquez pour supprimer', 'admin');
                    tagEl.dataset.tooltipType = 'info';
                }

                tagEl.onclick = () => {
                    if (!this.deletionMode) return;

                    this.waitingTags = this.waitingTags.filter(t => t.id !== tag.id);
                    tagEl.remove();
                    this.updateTagButtonVisibility();
                };

                tagList.appendChild(tagEl);
            });
        };

        this.updateTagList();

        const {searchContainer, result} = BuildHelper.search(
            __('Ajouter un tag', 'admin') + '...',
            (value, results_el) => {
                this.new_tag = value;
                results_el.innerHTML = '';
                const filtered =
                    this.gallery.tags.filter(tag => tag.name.toLowerCase().includes(value.toLowerCase())
                        && !media.tags.some(t => t.id === tag.id)
                        && !this.waitingTags.some(t => t.id === tag.id));

                if (filtered.length) {
                    this.tagAddBtn.classList.add('hidden');
                    results_el.classList.add('active');
                } else {
                    this.tagAddBtn.classList.remove('hidden');
                    results_el.classList.remove('active');
                }

                filtered.forEach(tag => {
                    const tagEl = BuildHelper.div('result-item');
                    tagEl.textContent = tag.name;
                    tagEl.dataset.tag = tag.id;
                    results_el.appendChild(tagEl);
                });
            },
            (item) => {
                const tagId = parseInt(item.dataset.tag);
                const tag = this.gallery.tags.find(t => t.id === tagId);
                if (!tag) return;

                tag.new = true;
                this.waitingTags.push(tag);

                searchContainer.dispatchEvent(new Event('close'));
                this.updateTagList();
                this.updateTagButtonVisibility();
            }, 2);
        this.search = searchContainer;

        tagsContainer.append(tagActions, tagList, searchContainer);
        return tagsContainer;
    }

    buildActions(media) {
        const actions = BuildHelper.div('flex-actions');

        const dl = BuildHelper.div('icon');
        dl.innerHTML = '📥';
        dl.dataset.tooltip = __('Télécharger', 'admin');
        dl.dataset.tooltipType = 'info';
        dl.onclick = async () => {
            const blob = await (await fetch('/' + media.path)).blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = media.original_name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const open = BuildHelper.div('icon');
        open.innerHTML = '🔗';
        open.dataset.tooltip = __('Ouvrir', 'admin');
        open.dataset.tooltipType = 'info';
        open.onclick = () => window.open('/' + media.path, '_blank');

        const del = BuildHelper.div('icon danger');
        del.innerHTML = '🗑️';
        del.dataset.tooltip = __('Supprimer', 'admin');
        del.dataset.tooltipType = 'danger';
        del.onclick = async () => {

            ConfirmDialog.show(async () => {
                try {
                    const res = await fetch(`${this.gallery.apiUrl}/delete/${media.id}`, {method: 'DELETE'});
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    this.gallery.loadPage();
                    Toast.show(__('Média supprimé', 'admin'), {
                        type: 'success', icon: '✅', duration: 2000, position: 'bottom-right', closable: true
                    });
                    this.close();
                } catch (e) {
                    Toast.show('[MediaModalViewer] ' + __('Erreur suppression média :', 'admin') + ' ' + e.message, {
                        type: 'danger', icon: '⚠️', duration: 5000, position: 'bottom-right', closable: true
                    });
                    console.error('[MediaModalViewer] ' + __('Erreur suppression média :', 'admin'), e);
                }
            }, () => null, {
                title: __('Supprimer ce média ?', 'admin'),
                message: __('Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?', 'admin'),
                confirmText: __('Supprimer', 'admin'),
                cancelText: __('Annuler', 'admin'),
                confirmClass: 'button danger',
                cancelClass: 'button info',
            });
        };

        actions.append(dl, open, del);
        return actions;
    }

    buildPreview(media) {
        const preview = BuildHelper.div('media-modal--preview');
        if (media.mime_type.startsWith('image/')) {
            preview.appendChild(BuildHelper.img('/' + media.path, media.original_name));
        }//svg
        else if (media.mime_type.startsWith('image/svg')) {
            const svg = BuildHelper.img('/' + media.path, media.original_name);
            preview.appendChild(svg);
        } else {
            const icon = BuildHelper.div('media-card--icon');
            icon.innerHTML = this.gallery.getIconForMime(media.mime_type);
            preview.appendChild(icon);
        }
        return preview;
    }

    close() {
        this.modal.classList.remove('active');
        this.modal_content.innerHTML = '';
    }
}
