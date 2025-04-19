export class PageListManager {
    constructor(element, options = {}) {
        this.element = element;
        this.currentPage = 1;
        this.lastPage = 1;
        this.perPage = 100;
        this.indentSize = 20;
        this.draggedItem = null;
        this.draggedGroup = [];
        this.previewIndicator = null;
        this.previousState = null;
        this.ghostEl = null;

        this.contentContainer = document.createElement('div');
        this.contentContainer.className = 'page-list-content';
        this.element.appendChild(this.contentContainer);

        this.actionsContainer = document.createElement('div');
        this.actionsContainer.className = 'page-list-actions';
        this.element.appendChild(this.actionsContainer);

        this.topDropZone = null;

        this.load(this.currentPage);
    }

    async load(page = 1) {
        const payload = {
            page: page,
            per_page: this.perPage
        };

        const res = await fetch('/admin/api/page/list', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        this.currentPage = data.current_page;
        this.lastPage = data.last_page;

        const pages = this.buildHierarchy(data.pages);
        this.render(pages);
        this.renderUndoButton();
        this.initDragAndDrop();
    }

    buildHierarchy(pages) {
        const pageMap = {};
        pages.forEach(p => {
            p.children = [];
            pageMap[p.id] = p;
        });

        const roots = [];

        pages.forEach(p => {
            if (p.parent_id && pageMap[p.parent_id]) {
                pageMap[p.parent_id].children.push(p);
            } else {
                roots.push(p);
            }
        });

        const sortRecursive = (list) => {
            list.sort((a, b) => a.order - b.order);
            list.forEach(child => sortRecursive(child.children));
        };

        sortRecursive(roots);
        return roots;
    }

    render(pages) {
        this.contentContainer.innerHTML = '';

        this.topDropZone = document.createElement('div');
        this.topDropZone.className = 'preview-indicator';
        this.topDropZone.style.height = '6px';
        this.topDropZone.style.marginBottom = '6px';
        this.topDropZone.dataset.position = 'top';
        this.topDropZone.style.display = 'none';
        this.contentContainer.appendChild(this.topDropZone);

        this.topDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.topDropZone.style.display = 'block';
            this.previewIndicator = this.topDropZone;
            window.debugPanel?.updateValue('previewPosition', 'top');
        });

        this.topDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!this.draggedItem) return;
            const startDepth = parseInt(this.draggedItem.dataset.depth || 0, 10);
            this.draggedGroup.forEach(el => {
                this.contentContainer.insertBefore(el, this.topDropZone.nextSibling);
                const currentDepth = parseInt(el.dataset.depth || 0, 10);
                const relativeDepth = currentDepth - startDepth;
                el.dataset.depth = relativeDepth;
                el.style.marginLeft = `${relativeDepth * this.indentSize}px`;
            });
            this.cleanAfterDrop('top');
        });

        this.renderRecursive(pages, 0);
    }

    renderRecursive(pages, depth) {
        pages.forEach(page => {
            const div = document.createElement('div');
            div.classList.add('page-item');
            div.textContent = page.title || `Page #${page.id}`;
            div.dataset.id = page.id;
            div.dataset.depth = depth;
            div.style.marginLeft = `${depth * this.indentSize}px`;
            this.contentContainer.appendChild(div);

            if (page.children && page.children.length) {
                this.renderRecursive(page.children, depth + 1);
            }
        });
    }

    initDragAndDrop() {
        this.contentContainer.querySelectorAll('.page-item').forEach(item => {
            item.draggable = true;
            item.addEventListener('dragstart', e => this.onDragStart(e, item));
            item.addEventListener('dragover', e => this.onDragOver(e, item));
            item.addEventListener('drop', e => this.onDrop(e, item));
            item.addEventListener('dragenter', e => e.preventDefault());
        });

        this.contentContainer.addEventListener('drop', e => this.onDropOutside(e));
        this.contentContainer.addEventListener('dragover', e => e.preventDefault());
    }

    onDragStart(e, item) {
        this.draggedItem = item;
        item.classList.add('dragging');
        this.previousState = this.contentContainer.innerHTML;

        const items = Array.from(this.contentContainer.querySelectorAll('.page-item'));
        const startIndex = items.indexOf(item);
        const startDepth = parseInt(item.dataset.depth || 0, 10);

        this.draggedGroup = [item];

        for (let i = startIndex + 1; i < items.length; i++) {
            const depth = parseInt(items[i].dataset.depth || 0, 10);
            if (depth > startDepth) {
                this.draggedGroup.push(items[i]);
                items[i].classList.add('dragging');
            } else {
                break;
            }
        }

        this.ghostEl = item.cloneNode(true);
        this.ghostEl.style.position = 'absolute';
        this.ghostEl.style.top = '-9999px';
        this.ghostEl.style.left = '-9999px';
        document.body.appendChild(this.ghostEl);
        e.dataTransfer.setDragImage(this.ghostEl, 0, 0);

        e.dataTransfer.setData('text/plain', '');
        e.dataTransfer.effectAllowed = 'move';

        window.debugPanel?.updateValue('draggedItem', item.dataset.id);
        window.debugPanel?.updateValue('draggedGroupSize', this.draggedGroup.length);
    }

    onDragOver(e, item) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.draggedItem || this.draggedGroup.includes(item)) return;

        window.debugPanel?.updateValue('dragOverItem', item.dataset.id);

        this.removePreview();

        const bounding = item.getBoundingClientRect();
        const offsetY = e.clientY - bounding.top;
        const third = bounding.height / 3;

        if (offsetY < third) {
            this.previewIndicator = document.createElement('div');
            this.previewIndicator.className = 'preview-indicator';
            item.before(this.previewIndicator);
            this.previewIndicator.dataset.position = 'above';
            window.debugPanel?.updateValue('previewPosition', 'above');
        } else if (offsetY > 2 * third) {
            this.previewIndicator = document.createElement('div');
            this.previewIndicator.className = 'preview-indicator';
            item.after(this.previewIndicator);
            this.previewIndicator.dataset.position = 'below';
            window.debugPanel?.updateValue('previewPosition', 'below');
        } else {
            item.classList.add('highlight-parent');
            this.dragOverParentItem = item;
            this.previewIndicator = item;
            this.previewIndicator.dataset.position = 'child-of';
            window.debugPanel?.updateValue('previewPosition', 'child-of');
        }
    }

    onDrop(e, targetItem) {
        e.preventDefault();
        e.stopPropagation();

        if (!this.draggedItem || this.draggedGroup.includes(targetItem)) {
            window.debugPanel?.updateValue('info', 'Drop annulé : même élément ou groupe déplacé sur lui-même');
            this.cleanAfterDrop('cancelled');
            return;
        }

        const position = this.previewIndicator?.dataset?.position ?? null;
        const parent = targetItem.parentElement;

        if (!position) {
            window.debugPanel?.updateValue('drop', 'aucune position détectée');
            this.cleanAfterDrop('cancelled');
            return;
        }

        if (position === 'child-of' && this.draggedItem && this.dragOverParentItem) {
            this.draggedGroup.forEach(el => this.contentContainer.insertBefore(el, this.dragOverParentItem));
            this.dragOverParentItem.style.marginLeft = this.draggedItem.style.marginLeft;
            this.draggedItem.style.marginLeft = `${parseInt(this.draggedItem.style.marginLeft || 0, 10) - this.indentSize}px`;
            this.cleanAfterDrop('swap');
            return;
        }

        const next = (position === 'below' || position === 'child-of') ? targetItem.nextSibling : targetItem;
        const referenceIndent = parseInt(targetItem.style.marginLeft || 0, 10);
        const startDepth = parseInt(this.draggedItem.dataset.depth || 0, 10);
        const newBaseIndent = (position === 'child-of')
            ? referenceIndent + this.indentSize
            : referenceIndent;

        this.draggedGroup.forEach(el => {
            const currentDepth = parseInt(el.dataset.depth || 0, 10);
            const relativeDepth = currentDepth - startDepth;
            const adjustedDepth = Math.max(0, Math.floor(newBaseIndent / this.indentSize) + relativeDepth);
            el.dataset.depth = adjustedDepth;
            el.style.marginLeft = `${adjustedDepth * this.indentSize}px`;
            parent.insertBefore(el, next);
        });

        this.cleanAfterDrop(position);
    }

    cleanAfterDrop(positionLabel) {
        window.debugPanel?.updateValue('previewPositionDropped', positionLabel);

        this.draggedGroup.forEach(el => el.classList.remove('dragging'));
        this.draggedGroup = [];
        this.draggedItem = null;

        if (this.ghostEl) {
            this.ghostEl.remove();
            this.ghostEl = null;
        }

        if (this.topDropZone) {
            this.topDropZone.style.display = 'none';
        }

        this.removePreview();
        this.recalculateOrderAndHierarchy();
    }

    onDropOutside(e) {
        e.preventDefault();
        if (!this.draggedItem) return;

        window.debugPanel?.updateValue('drop', 'déposé en dehors d’une cible');
        this.cleanAfterDrop('outside');
    }

    recalculateOrderAndHierarchy() {
        const items = Array.from(this.contentContainer.querySelectorAll('.page-item'));
        const hierarchyPayload = [];
        let parentStack = [];

        items.forEach((item, index) => {
            const id = parseInt(item.dataset.id);
            const depth = this.getDepthFromIndent(item);

            while (parentStack.length > depth) {
                parentStack.pop();
            }

            const parent_id = parentStack.length > 0 ? parseInt(parentStack[parentStack.length - 1]) : null;
            parentStack = parentStack.slice(0, depth);
            parentStack.push(id);

            hierarchyPayload.push({
                id: id,
                parent_id: parent_id,
                order: index
            });

            item.dataset.depth = depth;
        });

        this.sendHierarchyUpdate(hierarchyPayload);
    }

    getDepthFromIndent(item) {
        const indent = parseInt(item.style.marginLeft || 0, 10);
        return Math.floor(indent / this.indentSize);
    }

    sendHierarchyUpdate(payload) {
        fetch('/admin/api/page/hierachy', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => console.log('Hiérarchie mise à jour', data))
            .catch(err => console.error('Erreur hiérarchie', err));
    }

    removePreview() {
        if (this.previewIndicator && this.previewIndicator !== this.topDropZone && this.previewIndicator.classList.contains('preview-indicator')) {
            this.previewIndicator.remove();
        }
        this.previewIndicator = null;

        if (this.dragOverParentItem) {
            this.dragOverParentItem.classList.remove('highlight-parent');
            this.dragOverParentItem = null;
        }
    }

    renderUndoButton() {
        if (this.undoBtn) return;
        this.undoBtn = document.createElement('button');
        this.undoBtn.textContent = 'Annuler le dernier déplacement';
        this.undoBtn.className = 'undo-button';
        this.undoBtn.addEventListener('click', () => {
            if (this.previousState) {
                this.contentContainer.innerHTML = this.previousState;
                this.previousState = null;
                this.initDragAndDrop();
                window.debugPanel?.updateValue('undo', 'Rétabli');
            } else {
                window.debugPanel?.updateValue('undo', 'Aucun état précédent');
            }
        });

        this.actionsContainer.appendChild(this.undoBtn);
    }
}