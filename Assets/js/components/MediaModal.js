
export default class MediaModal {
    constructor(gridSelector = '.__mediaGrid') {
        this.grid = document.querySelector(gridSelector);
        this.init();
    }

    init() {
        if (!this.grid) return;

        this.grid.addEventListener('click', (e) => {
            const card = e.target.closest('.__mediaCard');
            if (card) {
                const id = card.dataset.id;
                this.openModal(id);
            }
        });

        this.createModalElements();
    }

    createModalElements() {
        this.modal = document.createElement('div');
        this.modal.className = 'media-modal hidden';
        this.modal.innerHTML = `
            <div class="media-modal-content">
                <button class="media-modal-close">✖</button>
                <div class="media-modal-body">Chargement...</div>
            </div>
        `;
        document.body.appendChild(this.modal);

        this.modal.querySelector('.media-modal-close').addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    async openModal(mediaId) {
        const body = this.modal.querySelector('.media-modal-body');
        body.innerHTML = 'Chargement...';
        this.modal.classList.remove('hidden');

        try {
            const response = await fetch('/admin/medias/view/' + mediaId);
            if (!response.ok) throw new Error('Erreur lors du chargement');

            const html = await response.text();
            body.innerHTML = html;
        } catch (err) {
            body.innerHTML = '<div class="error">Erreur de chargement du média</div>';
        }
    }

    closeModal() {
        this.modal.classList.add('hidden');
    }
}
