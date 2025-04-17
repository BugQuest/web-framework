import BuildHelper from "./BuildHelper";
import ConfirmDialog from "./ConfirmDialog";

export default class MediaModalViewer {
    constructor(gallery) {
        this.gallery = gallery;
        this.waitingTags = [];
        this.deletionMode = false;

        const {modal, content, close} = BuildHelper.modal(null, () => {
            this.waitingTags = [];
            this.deletionMode = false;
            content.innerHTML = '';
        });

        this.modal = modal;
        this.modal_content = content;
        document.body.appendChild(this.modal);
    }

    async open(media) {
        this.waitingTags = [];
        this.deletionMode = false;
        this.modal_content.innerHTML = '';

        const container = BuildHelper.div('media-modal');

        container.appendChild(this.buildActions(media));
        container.appendChild(this.buildPreview(media));

        const info = BuildHelper.div('media-modal--info');
        const infoContainer = BuildHelper.div('media-modal--info-container');

        const title = BuildHelper.h2(media.original_name);
        const infoSub = BuildHelper.div();
        const list = BuildHelper.list([
            `<strong>Type :</strong> ${media.mime_type}`,
            `<strong>Taille :</strong> ${(media.size / 1024).toFixed(1)} ko`,
            `<strong>Extension :</strong> ${media.extension}`,
            `<strong>Ajouté le :</strong> ${new Date(media.created_at).toLocaleDateString('fr-FR')}`,
        ]);

        infoSub.appendChild(title);
        infoSub.appendChild(list);
        infoContainer.appendChild(infoSub);

        infoContainer.appendChild(this.buildTagEditor(media));
        info.appendChild(infoContainer);

        if (media.exif && typeof media.exif === 'object' && Object.keys(media.exif).length > 0) {
            const {accordeon, accordeon_content} = BuildHelper.accordion('EXIF', 'small');
            const exifList = BuildHelper.list(
                Object.entries(media.exif).map(([key, value]) =>
                    `<strong>${key}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : value}`
                )
            );
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
        button.title = 'Mettre à jour les tags';

        button.onclick = async () => {

            if (this.waitingTags.length === 0) return;

            let tagIds = [];
            media.tags?.forEach(tag => {
                if (!tagIds.includes(tag.id)) {
                    tagIds.push(tag.id);
                }
            });

            this.waitingTags.forEach(tag => {
                if (!tagIds.includes(tag.id)) {
                    tagIds.push(tag.id);
                }
            });

            if (tagIds.length === 0) return;

            const encoded = tagIds.map(id => `tags[]=${encodeURIComponent(id)}`).join('&');

            try {
                const res = await fetch(`${this.gallery.apiUrl}/tags/set/${media.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: encoded
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                // Success
                this.close();
            } catch (err) {
                console.error('[MediaModalViewer] Erreur mise à jour des tags :', err);
            }
        };

        return button;
    }


    buildTagDeleteToggle() {
        const button = BuildHelper.div('icon danger');
        button.innerHTML = '❌';
        button.title = 'Activer le mode suppression de tags';

        button.onclick = () => {
            this.deletionMode = !this.deletionMode;
            button.classList.toggle('active', this.deletionMode);
        };

        return button;
    }

    buildTagEditor(media) {
        const tagsContainer = BuildHelper.div('media-modal--tags');
        const tagList = BuildHelper.div('media-modal--tags-list');
        const tagActions = BuildHelper.div('media-modal--tags-actions');

        this.tagUpdateBtn = this.buildTagUpdateButton(media);
        this.tagDeleteToggleBtn = this.buildTagDeleteToggle();
        tagActions.append(this.tagUpdateBtn, this.tagDeleteToggleBtn)

        const updateTagButtonVisibility = () => {
            if (this.waitingTags.length > 0)
                this.tagUpdateBtn.classList.remove('hidden');
            else
                this.tagUpdateBtn.classList.add('hidden');
        };

        media.tags?.forEach(tag => {
            const tagEl = BuildHelper.div('tag');
            tagEl.textContent = tag.name;
            tagEl.dataset.tag = tag.id;

            tagEl.onclick = () => {
                if (!this.deletionMode) return;

                ConfirmDialog.show(
                    `Supprimer le tag "${tag.name}" de ce média ?`,
                    () => {
                        tagEl.remove();
                        media.tags = media.tags.filter(t => parseInt(t.id) !== parseInt(tag.id));
                        updateTagButtonVisibility(); // facultatif ici
                    },
                    () => {
                    }
                );
            };

            tagList.appendChild(tagEl);
        });

        const {searchContainer, result} = BuildHelper.search(
            'Ajouter un tag...',
            (value, results_el) => {
                results_el.innerHTML = '';
                const filtered = this.gallery.tags.filter(tag =>
                    tag.name.toLowerCase().includes(value.toLowerCase()) &&
                    !media.tags.some(t => t.id === tag.id) &&
                    !this.waitingTags.some(t => t.id === tag.id)
                );

                if (filtered.length) results_el.classList.add('active');
                else results_el.classList.remove('active');

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

                this.waitingTags.push(tag);

                const tagEl = BuildHelper.div('tag new');
                tagEl.textContent = tag.name;
                tagEl.dataset.tag = tag.id;
                tagEl.onclick = () => {
                    this.waitingTags = this.waitingTags.filter(t => t.id !== tagId);
                    tagEl.remove();
                    updateTagButtonVisibility();
                };

                tagList.appendChild(tagEl);
                searchContainer.dispatchEvent(new Event('close'));
                updateTagButtonVisibility();
            },
            2
        );

        tagsContainer.append(tagActions, tagList, searchContainer);
        return tagsContainer;
    }

    buildActions(media) {
        const actions = BuildHelper.div('flex-actions');

        const dl = BuildHelper.div('icon');
        dl.innerHTML = '📥';
        dl.title = 'Télécharger';
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
        open.title = 'Ouvrir';
        open.onclick = () => window.open('/' + media.path, '_blank');

        const del = BuildHelper.div('icon danger');
        del.innerHTML = '🗑️';
        del.title = 'Supprimer';
        del.onclick = async () => {

            ConfirmDialog.show(
                async () => {
                    const res = await fetch(`${this.gallery.apiUrl}/delete/${media.id}`, {method: 'DELETE'});
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    this.gallery.loadPage();
                    this.close();
                },
                () => {
                },
                {
                    title: 'Supprimer ce média ?',
                    message: 'Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?',
                    confirmText: 'Supprimer',
                    cancelText: 'Annuler',
                    confirmClass: 'button danger',
                    cancelClass: 'button info',
                }
            );
        };

        actions.append(dl, open, del);
        return actions;
    }

    buildPreview(media) {
        const preview = BuildHelper.div('media-modal--preview');
        if (media.mime_type.startsWith('image/')) {
            preview.appendChild(BuildHelper.img('/' + media.path, media.original_name));
        } else {
            const icon = BuildHelper.div('media-card--icon');
            icon.innerHTML = this.getIconForMime(media.mime_type);
            preview.appendChild(icon);
        }
        return preview;
    }

    getIconForMime(mime) {
        if (mime === 'application/pdf') return '📄';
        if (mime === 'text/plain') return '📃';
        return '📁';
    }

    close() {
        this.modal.classList.remove('active');
        this.modal_content.innerHTML = '';
    }
}
