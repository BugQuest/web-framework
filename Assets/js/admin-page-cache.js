import {Toast} from '@framework/js/services/Toast';
import Builder from '@framework/js/services/Builder';

const API = '/admin/api/cache';

async function clearCache(group, label) {
    try {
        const res = await fetch(`${API}/${group}`, {method: 'POST'});
        const data = await res.json();

        if (data.success)
            Toast.show(data.message || `${label} vidé`, {type: 'success', icon: '✅', duration: 3000, position: 'bottom-right'});
        else
            throw new Error(data.message || 'Erreur inconnue');
    } catch (e) {
        Toast.show(e.message, {type: 'danger', icon: '⚠️', duration: 5000, position: 'bottom-right', closable: true});
    }
}

function makeCard(icon, title, group) {
    const card = Builder.div('cache-card');

    const header = Builder.div('cache-card-header');
    header.appendChild(Builder.createEl('span', 'cache-card-icon', icon));
    header.appendChild(Builder.createEl('strong', null, title));
    card.appendChild(header);

    const btn = Builder.createEl('button', 'bq-btn danger', 'Vider');
    btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = '…';
        await clearCache(group, title);
        btn.disabled = false;
        btn.textContent = 'Vider';
    });
    card.appendChild(btn);

    return card;
}

async function init(container) {
    const grid = Builder.div('cache-grid');
    container.appendChild(grid);

    grid.appendChild(makeCard('🌿', 'Cache Twig', 'twig'));
    grid.appendChild(makeCard('🖼️', 'Cache Images', 'images'));

    try {
        const res = await fetch(`${API}/groups`);
        const groups = await res.json();

        for (const group of groups)
            grid.appendChild(makeCard('📦', `Cache : ${group}`, group));
    } catch (e) {
        Toast.show('Impossible de charger les groupes cache', {type: 'danger', icon: '⚠️', position: 'bottom-right'});
    }
}

document.addEventListener('bqAdminLoaded', () => {
    const container = document.getElementById('cache-manager');
    if (!container) return;
    init(container);
});
