import Builder from '@framework/js/services/Builder';

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

        const toast_el = Builder.div(`bq-toast ${type}`);
        if (icon) {
            const icon_el = Builder.div('bq-toast-icon');
            icon_el.innerHTML = icon;
            toast_el.appendChild(icon_el);
        }
        const message_el = Builder.div('bq-toast-message');
        message_el.innerHTML = message;
        toast_el.appendChild(message_el);

        if (closable) {
            const close_el = Builder.div('bq-toast-close');
            close_el.innerHTML = '✖';
            close_el.title = 'Fermer';
            close_el.addEventListener('click', () => this._removeToast(toast_el));
            toast_el.appendChild(close_el);
        }

        container.appendChild(toast_el);

        // Animation d’apparition
        requestAnimationFrame(() => {
            toast_el.classList.add('show');
        });

        if (duration > 0)
            setTimeout(() => this._removeToast(toast_el), duration);
    }

    static success(message) {
        this.show(message, {
            type: 'success',
            icon: '✅'
        });
    }

    static info(message) {
        this.show(message, {
            type: 'info',
            icon: 'ℹ️'
        });
    }

    static warning(message) {
        this.show(message, {
            type: 'warning',
            icon: '⚠️'
        });
    }

    static error(message) {
        this.show(message, {
            type: 'danger',
            icon: '❌'
        });
    }

    static _getContainer(position) {
        if (!this.containers.has(position)) {
            const container = Builder.div(`bq-toast-container ${position}`);
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