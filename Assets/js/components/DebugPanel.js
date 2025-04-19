import BuildHelper from '@framework/js/components/BuildHelper.js';

export class DebugPanel {
    static panel = null;
    static isDragging = false;
    static offset = {x: 0, y: 0};

    static async init() {
        this.panel = BuildHelper.div('debug-panel');
        const title = BuildHelper.h3('Debug Panel');
        const close_el = BuildHelper.div('close-btn');
        close_el.textContent = 'x';

        this.panel.append(title, close_el);
        document.body.appendChild(this.panel);
        if (!this.panel) return;

        // Restore position
        this.restoreFromStorage();

        // Toggle via touche ² (Backquote)
        document.addEventListener('keypress', (e) => {
            if (e.which === 178 || e.which === 64) {
                this.panel.classList.toggle('active');
                localStorage.setItem('debugPanelActive', this.panel.classList.contains('active'));
            }
        });

        // Bouton de fermeture
        const close = this.panel.querySelector('.close-btn');
        if (close) {
            close.addEventListener('click', () => {
                this.panel.classList.remove('active');
            });
        }

        // Dragging
        this.panel.addEventListener('mousedown', this.startDrag.bind(this));
        document.addEventListener('mousemove', this.onDrag.bind(this));
        document.addEventListener('mouseup', this.stopDrag.bind(this));

        await this.loadMetrics();

        window.debugPanel = this;
    }

    static startDrag(e) {
        if (!this.panel.classList.contains('active')) return;

        this.isDragging = true;
        this.offset.x = e.clientX - this.panel.offsetLeft;
        this.offset.y = e.clientY - this.panel.offsetTop;
        this.panel.classList.add('dragging');
        this.panel.style.transition = 'none';
    }

    static onDrag(e) {
        if (!this.isDragging) return;

        const x = e.clientX - this.offset.x;
        const y = e.clientY - this.offset.y;

        this.panel.style.left = `${x}px`;
        this.panel.style.top = `${y}px`;
        this.panel.style.bottom = 'auto';
        this.panel.style.right = 'auto';

        // Sauvegarde position en direct
        localStorage.setItem('debugPanelPosition', JSON.stringify({x, y}));
    }

    static stopDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.panel.classList.remove('dragging');
            this.panel.style.transition = '';
        }
    }

    static restoreFromStorage() {
        const isActive = localStorage.getItem('debugPanelActive');
        this.panel.classList.toggle('active', isActive === 'true');

        const pos = localStorage.getItem('debugPanelPosition');
        if (!pos) return;

        try {
            const {x, y} = JSON.parse(pos);
            this.panel.style.left = `${x}px`;
            this.panel.style.top = `${y}px`;
            this.panel.style.bottom = 'auto';
            this.panel.style.right = 'auto';
        } catch (e) {

            //set center of the screen
            const width = window.innerWidth;
            const height = window.innerHeight;
            const panelWidth = this.panel.offsetWidth;
            const panelHeight = this.panel.offsetHeight;
            const x = (width - panelWidth) / 2;
            const y = (height - panelHeight) / 2;
            this.panel.style.left = `${x}px`;
            this.panel.style.top = `${y}px`;
            this.panel.style.bottom = 'auto';
            this.panel.style.right = 'auto';
        }
    }

    static addGroup(group_key, group) {
        const {accordeon, accordeon_content} = BuildHelper.accordion(group_key);
        const wrap = BuildHelper.div('wrap');
        accordeon_content.appendChild(wrap);
        this.panel.appendChild(accordeon);

        for (const item_key in group) {
            const item = group[item_key];
            const item_div = BuildHelper.div('debug-line');
            item_div.innerHTML = `${item_key}: ${item}`;
            wrap.appendChild(item_div);
        }
    }

    static async loadMetrics() {
        await fetch('/admin/api/debug/metrics')
            .then(r => r.json())
            .then(data => {

                for (const group_key in data)
                    this.addGroup(group_key, data[group_key]);
            });
    }
}
