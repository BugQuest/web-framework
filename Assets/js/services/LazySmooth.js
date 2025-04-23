export class LazySmooth {
    static #observer = null;
    static #alreadyAnimated = new WeakSet();
    static #delay = 50;
    static #lastTime = 0;

    static initObserver() {
        if (this.#observer) return;

        this.#observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;

                if (
                    entry.isIntersecting &&
                    !this.#alreadyAnimated.has(el)
                ) {
                    this.#alreadyAnimated.add(el);
                    this.#observer.unobserve(el);

                    // Libère la hauteur réservée si nécessaire
                    el.style.minHeight = '';

                    const now = performance.now();
                    const timeSinceLast = now - this.#lastTime;
                    const delay = Math.max(this.#delay - timeSinceLast, 0);

                    this.#lastTime = now + delay;

                    setTimeout(() => {
                        el.classList.add('lazy-animated');
                    }, delay);
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
            if (!this.#alreadyAnimated.has(el)) {
                // Appliquer la hauteur réservée si data-lazy-height est présent
                const lazyHeight = el.dataset.lazyHeight;
                if (lazyHeight && !el.classList.contains('lazy-animated')) {
                    el.style.minHeight = lazyHeight;
                }

                this.#observer.observe(el);
            }
        });
    }
}