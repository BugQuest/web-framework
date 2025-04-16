import BuildHelper from './BuildHelper.js';

export default class MediaGallery {
    constructor(element) {
        this.element = element;

        this.canUpload = false;
        this.canModal = false;
        this.perPage = 12;
        this.selectTags = [];
        this.tags = [];
        //check if element has data-per-page attribute
        const perPage = this.element.dataset.perPage;
        if (perPage && !isNaN(perPage))
            this.perPage = parseInt(perPage, 10);

        const canUpload = this.element.dataset.canUpload;
        if (canUpload && canUpload === 'true')
            this.canUpload = true;

        const canModal = this.element.dataset.canModal;
        if (canModal && canModal === 'true')
            this.canModal = true;

        this.apiUrl = '/admin/medias';

        this.initElements();
        this.initEvents();
        this.loadTags();
        this.loadPage();
    }

    initElements() {

        //====== DROPZONE ======
        if (this.canUpload) {
            this.dropZone = BuildHelper.div('media-dropzone');
            this.element.appendChild(this.dropZone);
        }

        //====== TAGS ======
        let tags = BuildHelper.div('media-gallery-tags');
        this.element.appendChild(tags);

        //====== TAGS FORM / ACCORDION ======
        let {accordeon, accordeon_content} = BuildHelper.accordion('Ajouter des tags', 'small');
        tags.appendChild(accordeon);
        tags.appendChild(BuildHelper.glow_stick());

        let tags_form = BuildHelper.div('media-gallery-tags-form');
        accordeon_content.appendChild(tags_form);

        this.tag_input = BuildHelper.input_text('Ajouter un tag', '', 'small full');

        tags_form.appendChild(this.tag_input)
        this.tag_submit = BuildHelper.button_submit('Ajouter', 'button button-primary');
        this.tag_submit.addEventListener('click', (e) => {
            e.preventDefault();
            const tag = this.tag_input.value.trim();
            if (tag) {
                this.addTag(tag);
                this.tag_input.value = '';
            }
        })
        tags_form.appendChild(this.tag_submit);

        //====== TAGS CONTENT ======
        this.tags_content = BuildHelper.div('media-gallery-tags-content');
        tags.appendChild(this.tags_content)

        //====== MEDIA GALLERY ======
        let container = BuildHelper.div('fullw');
        this.element.appendChild(container);

        this.grid = BuildHelper.div('media-gallery-content');
        container.appendChild(this.grid);

        this.pagination = BuildHelper.div('media-gallery-pagination');
        container.appendChild(this.pagination)

        if (this.canModal) {
            let {modal, content, close} = BuildHelper.modal()
            this.modal = modal;
            this.modal_content = content;
            document.body.appendChild(this.modal);
        }
    }

    initEvents() {
        this.pagination.addEventListener('click', (e) => {
            const index = e.target.closest('span[data-page]');
            if (index) {
                e.preventDefault();
                const page = parseInt(index.dataset.page, 10);
                if (!isNaN(page))
                    this.loadPage(page);
            }
        });

        if (this.canUpload) {
            this.element.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.dropZone.classList.add('active');
            });

            this.element.addEventListener('dragleave', (e) => {
                if (e.relatedTarget === null || !this.dropZone.contains(e.relatedTarget)) {
                    this.dropZone.classList.remove('active');
                }
            });

            this.element.addEventListener('drop', (e) => {
                e.preventDefault();
                this.dropZone.classList.remove('active');
                const files = [...e.dataTransfer.files];
                for (const file of files)
                    this.uploadFile(file);
            });
        }

        if (this.canModal) {
            this.element.addEventListener('click', (e) => {
                const card = e.target.closest('.__media_card');
                if (card) {
                    try {
                        let media = JSON.parse(card.dataset.media)
                        this.openModal(media)
                    } catch (e) {
                        console.error('Erreur de parsing du média :', e);
                        return;
                    }
                }
            });
        }
    }

    async loadPage(page = 1) {
        try {
            const params = new URLSearchParams();
            params.set('per_page', this.perPage);

            this.selectTags.forEach(tagId => {
                params.append('tags[]', tagId);
            });

            const response = await fetch(
                `${this.apiUrl}/all/${page}?${params}`
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            this.renderMedia(result.items);
            this.renderPagination(result.current_page, result.last_page);
        } catch (err) {
            console.error('[MediaGalleryLoader] Erreur de chargement des médias :', err);
        }
    }

    async loadTags() {
        try {
            const response = await fetch(`${this.apiUrl}/tags/all`);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();

            this.tags = result;
            this.renderTags();
        } catch (err) {
            console.error('[MediaGalleryLoader] Erreur de chargement des tags :', err);
        }
    }

    async addTag(tag) {
        try {
            const response = await fetch(`${this.apiUrl}/tags/add`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: 'name=' + encodeURIComponent(tag),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();

            this.loadTags();
        } catch (err) {
            console.error('[MediaGalleryLoader] Erreur d\'ajout de tag :', err);
        }
    }

    renderMedia(mediaItems = []) {
        this.grid.innerHTML = '';
        mediaItems.forEach(media => {
            const card = this.createMediaCard(media);
            this.grid.appendChild(card);
        });
    }

    renderPagination(currentPage, lastPage) {
        this.pagination.innerHTML = '';

        for (let page = 1; page <= lastPage; page++) {
            const span = document.createElement('span');
            span.dataset.page = page;
            span.textContent = page;
            if (page === currentPage) span.classList.add('active');
            this.pagination.appendChild(span);
        }
    }

    renderTags() {
        this.tags_content.innerHTML = '';
        this.tags.forEach(tag => {
            const span = document.createElement('span');
            span.dataset.tag = tag.id;
            span.textContent = tag.name;
            this.tags_content.appendChild(span);
        });

        this.tags_content.addEventListener('click', (e) => {
            e.preventDefault();
            const tag = e.target.closest('span[data-tag]');
            if (!tag) return;

            let id = tag.dataset.tag;

            if (!id) return;

            if (this.selectTags.includes(id))
                this.selectTags.splice(this.selectTags.indexOf(id), 1);
            else
                this.selectTags.push(id)

            this.updateTags();
            this.loadPage(1);

        });
    }

    /*
        * Met à jour les tags de la galerie de médias. ajouter class active sur les tags sélectionnés
     */
    updateTags() {
        const tags = this.tags_content.querySelectorAll('span[data-tag]');
        tags.forEach(tag => {

            let id = tag.dataset.tag;

            if (!id) return;

            if (this.selectTags.includes(id))
                tag.classList.add('active');
            else
                tag.classList.remove('active');
        });
    }

    createMediaCard(media) {
        const div = document.createElement('div');
        div.className = 'media-card __media_card';
        div.dataset.id = media.id;

        const isImage = media.mime_type.startsWith('image/');

        div.innerHTML = `
            <div class="media-card--mime">${media.mime_type}</div>
            <div class="media-card--preview">
                ${isImage
            ? `<img src="/${media.path}" alt="${media.original_name}">`
            : `<div class="media-card--icon">${this.getIconForMime(media.mime_type)}</div>`}
            </div>
            <div class="media-card--meta">
                <div class="name">${media.original_name}</div>
                <div class="size">${(media.size / 1024).toFixed(1)} ko</div>
            </div>
        `;
        div.dataset.media = JSON.stringify(media);
        return div;
    }

    replaceCardWithMedia(tempCard, media) {
        const newCard = this.createMediaCard(media);
        tempCard.replaceWith(newCard);
    }

    getIconForMime(mime) {
        if (mime === 'application/pdf') return '📄';
        if (mime === 'text/plain') return '📃';
        return '📁';
    }

    uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const tempCard = BuildHelper.div('media-card uploading');
        tempCard.innerHTML = `
            <div class="media-card--preview">${this.getPreviewHTML(file)}</div>
            <div class="progress-bar"></div>
        `;
        this.grid.prepend(tempCard);

        const progressBar = tempCard.querySelector('.progress-bar');

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${this.apiUrl}/upload`);

        xhr.upload.onprogress = (e) => {
            const percent = Math.floor((e.loaded / e.total) * 100);
            progressBar.style.width = percent + '%';
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    this.replaceCardWithMedia(tempCard, response);
                } catch (err) {
                    tempCard.innerHTML = `<div class="error">❌ Réponse invalide</div>`;
                }
            } else {
                tempCard.innerHTML = `<div class="error">❌ Upload échoué</div>`;
            }
        };

        xhr.onerror = () => {
            tempCard.innerHTML = `<div class="error">❌ Erreur réseau</div>`;
        };

        xhr.send(formData);
    }

    getPreviewHTML(file) {
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            return `<img src="${url}" alt="preview">`;
        }
        return `<div class="media-card--icon">📄</div>`;
    }

    async openModal(media) {
        this.modal_content.innerHTML = '';
        let media_container = BuildHelper.div('media-modal');

        // 🧰 Actions
        let actions = BuildHelper.div('flex-actions');
        media_container.appendChild(actions);

        // 📥 Télécharger
        let download_button = BuildHelper.div('icon');
        download_button.innerHTML = '📥';
        download_button.title = 'Télécharger le fichier';
        download_button.addEventListener('click', async (e) => {
            e.preventDefault();
            const image = await fetch('/' + media.path);
            const blob = await image.blob();
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = media.original_name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
        actions.appendChild(download_button);

        // 🔗 Ouvrir dans un nouvel onglet
        let open_button = BuildHelper.div('icon');
        open_button.innerHTML = '🔗';
        open_button.title = 'Ouvrir dans un nouvel onglet';
        open_button.addEventListener('click', () => {
            window.open('/' + media.path, '_BugQuest');
        });
        actions.appendChild(open_button);

        // 🗑️ Supprimer
        let delete_button = BuildHelper.div('icon danger');
        delete_button.innerHTML = '🗑️';
        delete_button.title = 'Supprimer le fichier';
        delete_button.addEventListener('click', async () => {
            if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
                try {
                    const res = await fetch(`${this.apiUrl}/delete/${media.id}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    await this.loadPage(1);
                    this.modal.classList.remove('active');
                } catch (err) {
                    console.error('[MediaGalleryLoader] Erreur suppression média :', err);
                }
            }
        });
        actions.appendChild(delete_button);

        // 🖼️ Prévisualisation
        const preview = BuildHelper.div('media-modal--preview');
        media_container.appendChild(preview);

        if (media.mime_type.startsWith('image/')) {
            preview.appendChild(BuildHelper.img('/' + media.path, media.original_name));
        } else {
            const icon = BuildHelper.div('media-card--icon');
            icon.innerHTML = this.getIconForMime(media.mime_type);
            preview.appendChild(icon);
        }

        // ℹ️ Infos
        const info = BuildHelper.div('media-modal--info');
        media_container.appendChild(info);

        const info_container = BuildHelper.div('media-modal--info-container');
        info.appendChild(info_container);

        const title = BuildHelper.h2(media.original_name);
        const info_subcontainer = BuildHelper.div();
        info_subcontainer.appendChild(title);

        const list = BuildHelper.list([
            `<strong>Type :</strong> ${media.mime_type}`,
            `<strong>Taille :</strong> ${(media.size / 1024).toFixed(1)} ko`,
            `<strong>Extension :</strong> ${media.extension}`,
            `<strong>Ajouté le :</strong> ${new Date(media.created_at).toLocaleDateString('fr-FR')}`,
        ]);
        info_subcontainer.appendChild(list);
        info_container.appendChild(info_subcontainer);

        // 🏷️ Tags
        const tags = BuildHelper.div('media-modal--tags');
        info_container.appendChild(tags);


        const tags_list = BuildHelper.div('media-modal--tags-list');
        tags.appendChild(tags_list);

        // Affichage des tags existants
        if (Array.isArray(media.tags)) {
            media.tags.forEach(tag => {
                const tagEl = BuildHelper.div('tag');
                tagEl.textContent = tag.name;
                tags_list.appendChild(tagEl);
            });
        }

        const tag_input = document.createElement('input');
        tag_input.type = 'text';
        tag_input.placeholder = 'Ajouter un tag...';
        tag_input.className = 'media-tag-input hidden';
        tags.appendChild(tag_input);

        const tags_button = BuildHelper.div('icon');
        tags_button.innerHTML = '🏷️';
        tags_button.title = 'Tags associés';
        tags.appendChild(tags_button);

        tags_button.addEventListener('click', () => {
            tag_input.classList.toggle('hidden');
            tag_input.focus();
        });

        // 📷 EXIF
        if (media.exif && typeof media.exif === 'object' && Object.keys(media.exif).length > 0) {
            let { accordeon, accordeon_content } = BuildHelper.accordion('EXIF', 'small');
            info.appendChild(accordeon);

            const exifItems = Object.entries(media.exif).map(([key, value]) =>
                `<strong>${key}:</strong> ${typeof value === 'object' ? JSON.stringify(value) : value}`
            );

            const exifList = BuildHelper.list(exifItems);
            exifList.classList.add('media-modal--exif');
            accordeon_content.appendChild(exifList);
        }

        this.modal_content.appendChild(media_container);
        this.modal.classList.add('active');
    }

}
