document.addEventListener('DOMContentLoaded', () => {
    const filter = document.querySelector('.media-tag-filter');
    const cards = document.querySelectorAll('.__MediaCard');

    if (filter) {
        filter.addEventListener('change', () => {
            const selected = filter.value;

            cards.forEach(card => {
                const tags = card.dataset.tags.split(',');
                if (!selected || tags.includes(selected)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});
