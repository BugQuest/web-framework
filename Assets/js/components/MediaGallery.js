export default class MediaGallery {
    constructor(element) {
        this.element = element;
        this.apiUrl = '/admin/medias/all';

        this.initElements();

        if (this.grid && this.pagination) {
            this.init();
            this.loadPage();
        }
        else
            console.warn('[MediaGalleryLoader] Grid ou pagination introuvable, initialisation annulée.');
    }

    initElements() {
        this.grid = document.createElement('div');
        this.grid.className = 'media-gallery-content';
        this.element.appendChild(this.grid);

        this.pagination = document.createElement('nav');
        this.pagination.className = 'media-gallery-pagination';
        this.element.appendChild(this.pagination)
    }

    init() {
        this.pagination.addEventListener('click', (e) => {
            const index = e.target.closest('span[data-page]');
            if (index) {
                e.preventDefault();
                const page = parseInt(index.dataset.page, 10);
                if (!isNaN(page))
                    this.loadPage(page);
            }
        });
    }

    async loadPage(page = 1) {
        try {
            const url = `${this.apiUrl}/${page}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            this.renderMedia(result.items);
            this.renderPagination(result.current_page, result.last_page);
        } catch (err) {
            console.error('[MediaGalleryLoader] Erreur de chargement des médias :', err);
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

    createMediaCard(media) {
        const div = document.createElement('div');
        div.className = 'media-card __media_card';
        div.dataset.id = media.id;

        const isImage = media.mime_type.startsWith('image/');

        div.innerHTML = `
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
}
