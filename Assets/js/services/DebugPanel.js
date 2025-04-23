import Builder from '@framework/js/services/Builder';
import {Toast} from '@framework/js/services/Toast';
import {__} from '@framework/js/services/Translator';

export class DebugPanel {
    static panel = null;
    static isDragging = false;
    static offset = {x: 0, y: 0};

    static async init() {
        this.panel = Builder.div('debug-panel');
        const title = Builder.h3('Debug Panel');
        const close_el = Builder.div('close-btn');
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
                localStorage.setItem('debugPanelActive', false);
            });
        }

        // Dragging
        this.panel.addEventListener('mousedown', this.startDrag.bind(this));
        document.addEventListener('mousemove', this.onDrag.bind(this));
        document.addEventListener('mouseup', this.stopDrag.bind(this));

        await this.loadMetrics();

        this.kvSection = Builder.div('kv-section');
        this.kvWrap = Builder.div('wrap');
        this.panel.appendChild(this.kvSection);
        this.kvValues = {}; // pour stocker les refs HTML des valeurs

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
        const {accordeon, accordeon_content} = Builder.accordion(group_key);
        const wrap = Builder.div('wrap');
        accordeon_content.appendChild(wrap);
        this.panel.appendChild(accordeon);

        if (Array.isArray(group)) {
            // Cas spécial tableau (ex: queries SQL)
            if (group_key === 'queries') {
                const head = ['SQL', 'Bindings', 'Durée'];
                const body = group.map(row => {
                    const time = parseFloat(row.time);
                    const displayTime = time >= 1000
                        ? `${(time / 1000).toFixed(3)} s`
                        : `${time.toFixed(2)} ms`;

                    return [
                        { value: row.query, full: row.query }, // pour title
                        row.bindings.map(b => `"${b}"`).join(', '),
                        displayTime
                    ];
                });

                const totalTime = group.reduce((sum, row) => sum + parseFloat(row.time), 0);
                const displayTotal = totalTime >= 1000
                    ? `${(totalTime / 1000).toFixed(3)} s`
                    : `${totalTime.toFixed(2)} ms`;

                // Construction du tableau via Builder.table
                const table = Builder.table(head, body, 'debug-table');

                // Ajout du tfoot
                const tfoot = document.createElement('tfoot');
                const tr = document.createElement('tr');

                const tdLabel = document.createElement('td');
                tdLabel.textContent = 'Total';
                tdLabel.colSpan = 2;

                const tdTotal = document.createElement('td');
                tdTotal.textContent = displayTotal;

                tr.append(tdLabel, tdTotal);
                tfoot.appendChild(tr);
                table.appendChild(tfoot);

                wrap.appendChild(table);
                return;
            }

            // Autres tableaux si besoin (logs, appels API, etc.)
            group.forEach((item, index) => {
                const div = Builder.div('debug-line');
                div.textContent = `${index}: ${JSON.stringify(item)}`;
                wrap.appendChild(div);
            });

        } else {
            // Cas classique objet clé: valeur
            for (const item_key in group) {
                const item = group[item_key];
                const item_div = Builder.div('debug-line');
                item_div.innerHTML = `${item_key}: ${item}`;
                wrap.appendChild(item_div);
            }
        }
    }


    static renderQueries() {

    }

    static async loadMetrics() {
        await fetch('/admin/api/debug/metrics')
            .then(r => r.json())
            .then(data => {

                if (!data) return;

                if ("success" in data && !data.success) {
                    Toast.show(__('Erreur lors du chargement des metrics:', 'admin') + ' ' + data?.message, {
                        type: 'danger',
                        icon: '❌'
                    });
                    console.error(__('Erreur lors du chargement des metrics:', 'admin') + ' ' + data?.message);
                    return;
                }

                for (const group_key in data)
                    this.addGroup(group_key, data[group_key]);
            });
    }

    static updateValue(key, value) {
        if (!this.kvValues) return;

        if (!this.kvValues[key]) {
            const line = Builder.div('debug-line');
            line.innerHTML = `<strong>${key}</strong>: <span class="debug-value">${value}</span>`;
            this.kvWrap.appendChild(line);
            this.kvValues[key] = line.querySelector('.debug-value');
        } else {
            this.kvValues[key].textContent = value;
        }
    }

}
