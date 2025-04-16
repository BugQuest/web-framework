import Gallery from './Gallery.js';

export default class MediaGalleryLoader {
    constructor(apiUrl = '/admin/medias/all/', gridSelector = '.__mediaGrid', paginationSelector = '.__mediaPagination') {
        this.apiUrl = apiUrl;
        this.grid = document.querySelector(gridSelector);
        this.pagination = document.querySelector(paginationSelector);

        if (this.grid && this.pagination) {
            this.init();
        } else {
            console.warn('[MediaGalleryLoader] Grid ou pagination introuvable, initialisation annulée.');
        }
    }

    init() {
        this.pagination.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-page]');
            if (link) {
                e.preventDefault();
                const page = parseInt(link.dataset.page, 10);
                if (!isNaN(page)) {
                    this.loadPage(page);
                }
            }
        });
    }

    async loadPage(page = 1) {
        try {
            const url = `${this.apiUrl}${page}`;
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
            const card = Gallery.createMediaCard(media);
            this.grid.appendChild(card);
        });
    }

    renderPagination(currentPage, lastPage) {
        this.pagination.innerHTML = '';

        for (let page = 1; page <= lastPage; page++) {
            const a = document.createElement('a');
            a.href = '#';
            a.dataset.page = page;
            a.textContent = page;
            if (page === currentPage) a.classList.add('active');
            this.pagination.appendChild(a);
        }
    }
}
