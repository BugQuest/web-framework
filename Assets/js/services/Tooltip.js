import Builder from '@framework/js/services/Builder';

export class Tooltip {
    static currentTarget = null;
    static observer = null;

    static setup() {
        document.addEventListener('mouseover', Tooltip.handleMouseOver);
        document.addEventListener('mouseout', Tooltip.handleMouseOut);
        document.addEventListener('mousemove', Tooltip.handleMouseMove);

        // Sécurité
        window.addEventListener('blur', Tooltip.hide);
        document.addEventListener('visibilitychange', Tooltip.hide);
        window.addEventListener('contextmenu', Tooltip.hide);
        window.addEventListener('keydown', Tooltip.hide);
        window.addEventListener('resize', Tooltip.hide);

        // MutationObserver pour éviter les orphelins
        Tooltip.observer = new MutationObserver(() => {
            if (Tooltip.currentTarget && !document.body.contains(Tooltip.currentTarget)) {
                Tooltip.hide();
            }
        });

        Tooltip.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    static handleMouseOver(e) {
        const target = e.target.closest('[data-tooltip]');
        if (!target || target === Tooltip.currentTarget) return;

        Tooltip.hide(); // Nettoie avant d’en montrer un nouveau
        Tooltip.currentTarget = target;
        Tooltip.show(target);
    }

    static handleMouseOut(e) {
        const target = e.target.closest('[data-tooltip]');
        if (target && target === Tooltip.currentTarget) {
            Tooltip.hide();
        }
    }

    static handleMouseMove(e) {
        if (Tooltip.currentTarget && Tooltip.currentTarget._bqTooltip)
            Tooltip.move(e, Tooltip.currentTarget._bqTooltip);
    }

    static show(target) {
        const text = target.dataset.tooltip;
        if (!text) return;

        const tooltip = Builder.div('bq-tooltip');
        const type = target.dataset.tooltipType;
        if (type) tooltip.classList.add(type);

        tooltip.innerHTML = text;
        document.body.appendChild(tooltip);

        target._bqTooltip = tooltip;

        const fakeEvent = {clientX: 0, clientY: 0, ...window.event};
        Tooltip.move(fakeEvent, tooltip);
    }

    static move(e, tooltip) {
        const offset = 12;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const tooltipRect = tooltip.getBoundingClientRect();
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;

        let top = mouseY + offset;
        let left = mouseX + offset;

        if (mouseX + tooltipRect.width + offset > winWidth)
            left = mouseX - tooltipRect.width - offset;

        if (mouseY + tooltipRect.height + offset > winHeight)
            top = mouseY - tooltipRect.height - offset;

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    static hide() {
        if (Tooltip.currentTarget && Tooltip.currentTarget._bqTooltip) {
            Tooltip.currentTarget._bqTooltip.remove();
            Tooltip.currentTarget._bqTooltip = null;
        }
        Tooltip.currentTarget = null;
    }
}
