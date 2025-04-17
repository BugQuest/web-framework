export class Tooltip {
    static currentTarget = null;

    static setup() {
        document.addEventListener('mouseover', Tooltip.handleMouseOver);
        document.addEventListener('mouseout', Tooltip.handleMouseOut);
        document.addEventListener('mousemove', Tooltip.handleMouseMove);
    }

    static handleMouseOver(e) {
        const target = e.target.closest('[data-tooltip]');
        if (!target || target._bqTooltip) return;

        Tooltip.currentTarget = target;
        Tooltip.show(target);
    }

    static handleMouseOut(e) {
        const target = e.target.closest('[data-tooltip]');
        if (target && target._bqTooltip) {
            target._bqTooltip.remove();
            target._bqTooltip = null;
        }
        Tooltip.currentTarget = null;
    }

    static handleMouseMove(e) {
        if (Tooltip.currentTarget && Tooltip.currentTarget._bqTooltip) {
            Tooltip.move(e, Tooltip.currentTarget._bqTooltip);
        }
    }

    static show(target) {
        const text = target.dataset.tooltip;
        if (!text) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'bq-tooltip';

        const type = target.dataset.tooltipType;
        if (type) {
            tooltip.classList.add(type); // ex: .danger, .info...
        }

        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        target._bqTooltip = tooltip;

        // Position initiale
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

        if (mouseX + tooltipRect.width + offset > winWidth) {
            left = mouseX - tooltipRect.width - offset;
        }

        if (mouseY + tooltipRect.height + offset > winHeight) {
            top = mouseY - tooltipRect.height - offset;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }
}