export class Accordion {
    static setup(selector = '.accordeon') {
        document.addEventListener('click', (e) => {
            const title = e.target.closest(`${selector} .accordeon-title`);
            if (!title) return;

            const accordeon = title.closest(selector);
            const content = accordeon.querySelector('.accordeon-content');
            if (!content) return;

            Accordion.toggle(accordeon, content);
        });
    }

    static toggle(accordeon, content) {
        const isOpen = accordeon.classList.contains('active');

        if (isOpen) {
            // Active animation en mesurant la hauteur actuelle
            content.style.maxHeight = content.scrollHeight + 'px';

            // Forcer un reflow pour garantir la transition
            void content.offsetHeight;

            content.style.maxHeight = '0';
            accordeon.classList.remove('active');
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
            accordeon.classList.add('active');

            // Nettoyage après animation
            const onTransitionEnd = () => {
                if (accordeon.classList.contains('active')) {
                    content.style.maxHeight = 'none';
                }
                content.removeEventListener('transitionend', onTransitionEnd);
            };

            content.addEventListener('transitionend', onTransitionEnd);
        }
    }
}