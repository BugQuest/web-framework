export class LazySmooth {
    static #observer = null;
    static #alreadyAnimated = new WeakSet();
    static #inProgress = new WeakSet();
    static #staggerDelay = 50;

    static initObserver() {
        if (this.#observer) return;

        this.#observer = new IntersectionObserver((entries) => {
            let localQueuedIndex = 0; // <- Reset pour CHAQUE vague d'éléments visibles

            entries.forEach(entry => {
                const el = entry.target;

                if (
                    entry.isIntersecting &&
                    !this.#alreadyAnimated.has(el) &&
                    !this.#inProgress.has(el)
                ) {
                    this.#inProgress.add(el);
                    this.#observer.unobserve(el);

                    el.style.minHeight = '';

                    const triggerDelay = localQueuedIndex * this.#staggerDelay;
                    localQueuedIndex++;

                    setTimeout(() => {
                        el.classList.add('lazy-animated');
                        this.#alreadyAnimated.add(el);
                        this.#inProgress.delete(el);
                    }, triggerDelay);
                }
            });
        }, {
            threshold: 0.1
        });
    }

    static process() {
        this.initObserver();

        const elements = document.querySelectorAll('[data-lazy-smooth]');
        elements.forEach(el => {
            if (
                !this.#alreadyAnimated.has(el) &&
                !this.#inProgress.has(el)
            ) {
                if (el.dataset.lazyStyle) {
                    el.style.transform = el.dataset.lazyStyle;
                } else if ('lazyLeft' in el.dataset) {
                    el.style.transform = 'translateX(40px)';
                } else if ('lazyRight' in el.dataset) {
                    el.style.transform = 'translateX(-40px)';
                } else if ('lazyZoom' in el.dataset) {
                    el.style.transform = 'scale(0.8)';
                } else {
                    el.style.transform = 'translateY(40px)';
                }

                const lazyHeight = el.dataset.lazyHeight;
                if (lazyHeight && !el.classList.contains('lazy-animated')) {
                    el.style.minHeight = lazyHeight;
                }

                this.#observer.observe(el);
            }
        });
    }
}
