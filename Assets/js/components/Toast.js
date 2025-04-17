export class Toast {
    static containers = new Map();

    static show(message, {
        type = 'info',
        position = 'top-right',
        duration = 4000,
        icon = null,
        closable = true
    } = {}) {
        const container = this._getContainer(position);

        const toast = document.createElement('div');
        toast.className = `bq-toast ${type}`;
        toast.innerHTML = `
            ${icon ? `<div class="bq-toast-icon">${icon}</div>` : ''}
            <div class="bq-toast-message">${message}</div>
            ${closable ? `<button class="bq-toast-close" title="Fermer">✖</button>` : ''}
        `;

        if (closable) {
            toast.querySelector('.bq-toast-close').addEventListener('click', () => this._removeToast(toast));
        }

        container.appendChild(toast);

        // Animation d’apparition
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        if (duration > 0) {
            setTimeout(() => this._removeToast(toast), duration);
        }
    }

    static _getContainer(position) {
        if (!this.containers.has(position)) {
            const container = document.createElement('div');
            container.className = `bq-toast-container ${position}`;
            document.body.appendChild(container);
            this.containers.set(position, container);
        }
        return this.containers.get(position);
    }

    static _removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }
}