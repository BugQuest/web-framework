export default class Gallery {
    static createMediaCard(media) {
        const div = document.createElement('div');
        div.className = '__mediaCard';
        div.dataset.id = media.id;

        const isImage = media.mime_type.startsWith('image/');

        div.innerHTML = `
            <div class="__mediaCard__Preview">
                ${isImage
            ? `<img src="/${media.path}" alt="${media.original_name}">`
            : `<div class="__mediaCard__Icon">${this.getIconForMime(media.mime_type)}</div>`}
            </div>
            <div class="__mediaCard__meta">
                <div class="name">${media.original_name}</div>
                <div class="size">${(media.size / 1024).toFixed(1)} ko</div>
            </div>
        `;

        return div;
    }

    static getIconForMime(mime) {
        if (mime === 'application/pdf') return '📄';
        if (mime === 'text/plain') return '📃';
        return '📁';
    }

    static replaceCardWithMedia(tempCard, media) {
        const newCard = this.createMediaCard(media);
        tempCard.replaceWith(newCard);
    }
}
