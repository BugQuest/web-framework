import {Toast} from "@framework/js/services/Toast";

export class PageListManager {
    constructor(element, options = {}) {
        this.element = element;
        this.currentPage = 1;
        this.lastPage = 1;
        this.perPage = 100;

        this.container = document.createElement('div');
        this.container.className = 'page-list-content';
        this.element.appendChild(this.container);

        this.pagination = document.createElement('div');
        this.pagination.className = 'page-list-pagination';
        this.element.appendChild(this.pagination);

        this.actionsContainer = document.createElement('div');
        this.actionsContainer.className = 'page-list-actions';
        this.element.insertBefore(this.actionsContainer, this.container);

        this.draggedItem = null;
        this.previewIndicator = null;

        this.load(this.currentPage);
    }

    async load(page = 1) {
        const payload = {page, per_page: this.perPage};

        const res = await fetch('/admin/api/page/list', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        this.currentPage = data.current_page;
        this.lastPage = data.last_page;

        const hierarchy = this.buildHierarchy(data.pages);
        this.renderList(hierarchy);
        this.renderPagination();
    }

    buildHierarchy(pages) {
        const pageMap = {};
        const roots = [];

        pages.forEach(page => {
            page.children = [];
            pageMap[page.id] = page;
        });

        pages.forEach(page => {
            if (page.parent_id && pageMap[page.parent_id]) {
                pageMap[page.parent_id].children.push(page);
            } else {
                roots.push(page);
            }
        });

        const sortRecursive = list => {
            list.sort((a, b) => a.order - b.order);
            list.forEach(item => sortRecursive(item.children));
        };

        sortRecursive(roots);
        return roots;
    }

    renderList(pages) {
        this.container.innerHTML = '';
        this.renderRecursive(pages, 0, null);
    }

    renderRecursive(pages, depth, parentId) {
        pages.forEach((page, index) => {
            const el = document.createElement('div');
            el.className = 'page-item';
            el.style.marginLeft = `${depth * 20}px`;
            el.textContent = '';
            el.dataset.id = page.id;
            el.dataset.depth = depth;
            el.dataset.parentId = parentId ?? '';

            const dragHandle = document.createElement('span');
            dragHandle.className = 'drag-handle';
            dragHandle.textContent = '≡';
            dragHandle.draggable = true;

            dragHandle.addEventListener('dragstart', e => this.onDragStart(e, el));
            el.addEventListener('dragover', e => this.onDragOver(e, el));
            el.addEventListener('drop', e => this.onDrop(e, el));

            const title = document.createElement('span');
            title.className = 'page-title';
            title.textContent = page.title || `Page #${page.id}`;

            const actions = document.createElement('div');
            actions.className = 'page-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'icon-button';
            editBtn.title = 'Edit';
            editBtn.innerHTML = '✏️';
            editBtn.addEventListener('click', () => {
                window.location.href = `/admin/page/${page.id}`;
            });

            const viewBtn = document.createElement('button');
            viewBtn.className = 'icon-button';
            viewBtn.title = 'View';
            viewBtn.innerHTML = '👁️';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'icon-button';
            deleteBtn.title = 'Delete';
            deleteBtn.innerHTML = '🗑️';

            actions.appendChild(viewBtn);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            el.appendChild(dragHandle);
            el.appendChild(title);
            el.appendChild(actions);

            this.container.appendChild(el);

            if (page.children && page.children.length > 0) {
                this.renderRecursive(page.children, depth + 1, page.id);
            }
        });
    }

    onDragStart(e, item) {
        this.draggedItem = item;
        item.classList.add('dragging');
        e.dataTransfer.setData('text/plain', '');
        e.dataTransfer.effectAllowed = 'move';
    }

    onDragOver(e, target) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (!this.draggedItem || this.draggedItem === target) return;

        if (this.previewIndicator) this.previewIndicator.remove();

        const bounding = target.getBoundingClientRect();
        const offset = e.clientY - bounding.top;

        this.previewIndicator = document.createElement('div');
        this.previewIndicator.className = 'preview-indicator';

        if (offset < bounding.height / 3) {
            target.before(this.previewIndicator);
            this.previewIndicator.dataset.position = 'above';
        } else if (offset > 2 * bounding.height / 3) {
            target.after(this.previewIndicator);
            this.previewIndicator.dataset.position = 'below';
        } else {
            target.appendChild(this.previewIndicator);
            this.previewIndicator.dataset.position = 'child';
        }
    }

    onDrop(e, target) {
        e.preventDefault();
        if (!this.draggedItem || this.draggedItem === target) return;

        const position = this.previewIndicator?.dataset?.position;
        if (this.previewIndicator) this.previewIndicator.remove();

        const draggedId = this.draggedItem.dataset.id;
        const targetId = target.dataset.id;
        const draggedParent = this.draggedItem.dataset.parentId;
        const targetParent = target.dataset.parentId;

        const draggedDepth = parseInt(this.draggedItem.dataset.depth || '0', 10);
        const targetDepth = parseInt(target.dataset.depth || '0', 10);

        if (position === 'above') {
            target.before(this.draggedItem);
            this.draggedItem.dataset.parentId = targetParent;
            this.draggedItem.dataset.depth = targetDepth;
            this.draggedItem.style.marginLeft = `${targetDepth * 20}px`;
        } else if (position === 'below') {
            target.after(this.draggedItem);
            this.draggedItem.dataset.parentId = targetParent;
            this.draggedItem.dataset.depth = targetDepth;
            this.draggedItem.style.marginLeft = `${targetDepth * 20}px`;
        } else if (position === 'child') {
            if (draggedParent === targetId) {
                this.draggedItem.dataset.parentId = '';
                this.draggedItem.dataset.depth = '0';
                this.draggedItem.style.marginLeft = '0px';
                target.after(this.draggedItem);
            } else if (target.dataset.parentId === draggedId) {
                this.draggedItem.dataset.parentId = targetId;
                this.draggedItem.dataset.depth = `${targetDepth + 1}`;
                this.draggedItem.style.marginLeft = `${(targetDepth + 1) * 20}px`;
                target.before(this.draggedItem);
            } else {
                this.draggedItem.dataset.parentId = targetId;
                this.draggedItem.dataset.depth = `${targetDepth + 1}`;
                this.draggedItem.style.marginLeft = `${(targetDepth + 1) * 20}px`;
                target.after(this.draggedItem);
            }
        }

        this.draggedItem.classList.remove('dragging');
        this.draggedItem = null;

        this.updateOrderAndHierarchy();
    }

    updateOrderAndHierarchy() {
        const items = Array.from(this.container.querySelectorAll('.page-item'));
        const data = [];

        items.forEach((el, index) => {
            data.push({
                id: parseInt(el.dataset.id),
                parent_id: el.dataset.parentId ? parseInt(el.dataset.parentId) : null,
                order: index
            });
        });

        fetch('/admin/api/page/hierachy', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
    }

    renderPagination() {
        this.pagination.innerHTML = '';

        for (let i = 1; i <= this.lastPage; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.disabled = i === this.currentPage;
            btn.addEventListener('click', () => this.load(i));
            this.pagination.appendChild(btn);
        }
    }
}