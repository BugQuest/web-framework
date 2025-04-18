export class Accordion {
    static setup(selector = '.accordeon') {
        this.selector = selector;

        document.addEventListener('click', (e) => {
            const title = e.target.closest(`${this.selector} .accordeon-title`);
            if (!title) return;

            const accordeon = title.closest(this.selector);
            const content = accordeon.querySelector('.accordeon-content');
            if (!content) return;

            Accordion.toggle(accordeon, content);
        });
    }

    static toggle(accordeon, content) {
        const isOpen = accordeon.classList.contains('active');

        if (isOpen) {
            content.style.maxHeight = content.scrollHeight + 'px';
            requestAnimationFrame(() => {
                content.style.maxHeight = '0';
            });
            accordeon.classList.remove('active');
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
            accordeon.classList.add('active');
            setTimeout(() => {
                if (accordeon.classList.contains('active')) {
                    content.style.maxHeight = 'none';
                }
            }, 350);
        }
    }
}
