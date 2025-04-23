import BuildHelper from './BuildHelper.js';
import MediaModalViewer from './MediaModalViewer.js';

export default class MediaGallery {
    constructor(element) {
        this.element = element;

        this.canUpload = false;
        this.canModal = false;
        this.perPage = 12;
        this.selectTags = [];
        this.tags = [];
        this.waitingTags = [];
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
        const tags = BuildHelper.div('media-gallery-tags');
        this.element.appendChild(tags);

        //====== TAGS FORM / ACCORDION ======
        const {accordeon, accordeon_content} = BuildHelper.accordion('Ajouter des tags', 'small');
        tags.appendChild(accordeon);
        tags.appendChild(BuildHelper.glow_stick());

        const tags_form = BuildHelper.div('media-gallery-tags-form');
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
        const container = BuildHelper.div('fullw');
        this.element.appendChild(container);

        this.grid = BuildHelper.div('media-gallery-content');
        container.appendChild(this.grid);

        this.pagination = BuildHelper.div('media-gallery-pagination');
        container.appendChild(this.pagination)

        if (this.canModal)
            this.modal = new MediaModalViewer(this)
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
                for (let file of files)
                    this.uploadFile(file);
            });
        }

        if (this.canModal) {
            this.element.addEventListener('click', (e) => {
                const card = e.target.closest('.__media_card');
                if (card) {
                    try {
                        const media = JSON.parse(card.dataset.media)
                        this.modal.open(media)
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

            const id = tag.dataset.tag;

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

            const id = tag.dataset.tag;

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
}
