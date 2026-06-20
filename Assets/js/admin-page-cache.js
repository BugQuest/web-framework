import {Toast} from '@framework/js/services/Toast';
import Builder from '@framework/js/services/Builder';

const API = '/admin/api/cache';

function formatDate(ts) {
    if (!ts) return '∞';
    const d = new Date(ts * 1000);
    return d.toLocaleString('fr-FR', {day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'});
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' o';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' Ko';
    return (bytes / 1024 / 1024).toFixed(2) + ' Mo';
}

function formatTtl(expiresAt) {
    if (!expiresAt) return '∞';
    const left = expiresAt - Math.floor(Date.now() / 1000);
    if (left <= 0) return 'expiré';
    if (left < 60) return left + 's';
    if (left < 3600) return Math.floor(left / 60) + 'min';
    return Math.floor(left / 3600) + 'h ' + Math.floor((left % 3600) / 60) + 'min';
}

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

async function deleteEntry(group, hash, row) {
    try {
        const res = await fetch(`${API}/${group}/${hash}`, {method: 'DELETE'});
        const data = await res.json();
        if (data.success) {
            row.remove();
            Toast.show('Entrée supprimée', {type: 'success', icon: '✅', duration: 2000, position: 'bottom-right'});
        } else {
            throw new Error(data.message || 'Erreur');
        }
    } catch (e) {
        Toast.show(e.message, {type: 'danger', icon: '⚠️', duration: 4000, position: 'bottom-right'});
    }
}

async function loadEntries(group, tableBody, countEl) {
    tableBody.innerHTML = '<tr><td colspan="5" class="cache-loading">Chargement…</td></tr>';
    try {
        const res = await fetch(`${API}/list/${group}`);
        const items = await res.json();

        tableBody.innerHTML = '';
        countEl.textContent = items.length + ' entrée' + (items.length > 1 ? 's' : '');

        if (!items.length) {
            tableBody.innerHTML = '<tr><td colspan="5" class="cache-empty">Aucune entrée</td></tr>';
            return;
        }

        for (const item of items) {
            const tr = document.createElement('tr');

            const tdKey = document.createElement('td');
            tdKey.className = 'cache-entry-key';
            tdKey.textContent = item.key || '—';
            tdKey.title = item.key || '';

            const tdCreated = document.createElement('td');
            tdCreated.textContent = formatDate(item.created_at);

            const tdExpires = document.createElement('td');
            const ttl = formatTtl(item.expires_at);
            tdExpires.textContent = ttl;
            if (ttl === 'expiré') tdExpires.className = 'cache-expired';

            const tdSize = document.createElement('td');
            tdSize.textContent = formatSize(item.size);

            const tdAction = document.createElement('td');
            const btn = Builder.createEl('button', 'bq-btn danger sm', '✕');
            btn.title = 'Supprimer cette entrée';
            btn.addEventListener('click', async () => {
                btn.disabled = true;
                await deleteEntry(group, item.hash, tr);
                countEl.textContent = (tableBody.rows.length) + ' entrée' + (tableBody.rows.length > 1 ? 's' : '');
            });
            tdAction.appendChild(btn);

            tr.append(tdKey, tdCreated, tdExpires, tdSize, tdAction);
            tableBody.appendChild(tr);
        }
    } catch (e) {
        tableBody.innerHTML = '<tr><td colspan="5" class="cache-error">Erreur de chargement</td></tr>';
    }
}

function makeSection(icon, title, group) {
    const section = Builder.div('cache-section');

    // Header
    const header = Builder.div('cache-section-header');
    const left = Builder.div('cache-section-title');
    left.appendChild(Builder.createEl('span', 'cache-card-icon', icon));
    left.appendChild(Builder.createEl('strong', null, title));
    const countEl = Builder.createEl('span', 'cache-count', '…');

    const actions = Builder.div('cache-section-actions');
    const refreshBtn = Builder.createEl('button', 'bq-btn sm', '↺ Rafraîchir');
    const clearBtn = Builder.createEl('button', 'bq-btn danger sm', 'Tout vider');

    actions.append(refreshBtn, clearBtn);
    header.append(left, countEl, actions);
    section.appendChild(header);

    // Table
    const tableWrap = Builder.div('cache-table-wrap');
    const table = document.createElement('table');
    table.className = 'cache-table';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Clé</th><th>Créé</th><th>Expire dans</th><th>Taille</th><th></th></tr>';
    const tbody = document.createElement('tbody');
    table.append(thead, tbody);
    tableWrap.appendChild(table);
    section.appendChild(tableWrap);

    // Events
    refreshBtn.addEventListener('click', async () => {
        refreshBtn.disabled = true;
        await loadEntries(group, tbody, countEl);
        refreshBtn.disabled = false;
    });

    clearBtn.addEventListener('click', async () => {
        clearBtn.disabled = true;
        clearBtn.textContent = '…';
        await clearCache(group, title);
        await loadEntries(group, tbody, countEl);
        clearBtn.disabled = false;
        clearBtn.textContent = 'Tout vider';
    });

    loadEntries(group, tbody, countEl);

    return section;
}

async function init(container) {
    container.appendChild(makeSection('🌿', 'Twig', 'twig'));
    container.appendChild(makeSection('🖼️', 'Images', 'images'));

    try {
        const res = await fetch(`${API}/groups`);
        const groups = await res.json();
        for (const group of groups)
            container.appendChild(makeSection('📦', group, group));
    } catch (e) {
        Toast.show('Impossible de charger les groupes cache', {type: 'danger', icon: '⚠️', position: 'bottom-right'});
    }
}

document.addEventListener('bqAdminLoaded', () => {
    const container = document.getElementById('cache-manager');
    if (!container) return;
    init(container);
});
