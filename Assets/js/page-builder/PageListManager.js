import {Toast} from "@framework/js/services/Toast";
import Builder from '@framework/js/services/Builder.js';
import {LazySmooth} from '@framework/js/services/LazySmooth.js';

export class PageListManager {
    constructor(element, options = {}) {
        this.element = element;
        this.currentPage = 1;
        this.lastPage = 1;
        this.perPage = 100;
        this.currentParentTarget = null;
        this.pages = [];
        this.homepage = null;
        this.filters = {};
        this.selectedFilters = {
            status: [],
            search: '',
        };
        this.debounceSearchTimer = null;

        this.container = Builder.div('page-list-container');
        this.element.appendChild(this.container);

        this.pagination = Builder.div('page-list-pagination');
        this.element.appendChild(this.pagination);

        this.actionsContainer = Builder.div('page-list-actions');
        const addPageBtn = Builder.button('➕', 'button info', () => {
            window.location.href = '/admin/page';
        });
        addPageBtn.dataset.tooltip = 'Ajouter une page';
        this.actionsContainer.appendChild(addPageBtn);
        this.filter_status = Builder.selectMultiple(
            'Status',
            [
                {value: 'draft', label: 'Draft'},
                {value: 'published', label: 'Published'},
                {value: 'private', label: 'Private'},
                {value: 'archived', label: 'Archived'},
            ],
            null,
            (values) => {
                this.selectedFilters.status = values;
                this.load(1);
            },
            true,
            '',
        );
        const search_wrapper = Builder.div('search-wrapper');
        const progress = Builder.div('progress');
        this.search = Builder.input_search('Search', '',
            (value) => {
                // Reset animation de la barre
                progress.style.transition = 'none';
                progress.style.width = '0';

                // Lancer animation
                requestAnimationFrame(() => {
                    progress.style.transition = `width 1000ms linear`;
                    progress.style.width = '100%';
                });

                this.debounce(() => {
                    this.selectedFilters.search = value;
                    this.load(1);
                }, 1000);
            },
            () => {
                // Reset animation de la barre
                progress.style.transition = 'none';
                progress.style.width = '0';

                // Lancer animation
                requestAnimationFrame(() => {
                    progress.style.transition = `width 1000ms linear`;
                    progress.style.width = '100%';
                });

                this.debounce(() => {
                    this.selectedFilters.search = '';
                    this.load(1);
                }, 1000);
            },
            1
        );
        this.actionsContainer.appendChild(this.filter_status.getElement());
        this.actionsContainer.appendChild(search_wrapper);
        search_wrapper.appendChild(progress);
        search_wrapper.appendChild(this.search);
        this.element.insertBefore(this.actionsContainer, this.container);

        this.draggedItem = null;
        this.previewIndicator = null;

        this.statusModal = null;
        this.selectStatus = null;

        this.events();

        this.load(this.currentPage);
    }

    async load(page = 1) {
        const payload = {
            page,
            per_page: this.perPage,
            status: this.selectedFilters.status,
            search: this.selectedFilters.search
        };

        if (page == -1)
            page = this.currentPage;

        const res = await fetch('/admin/api/page/list', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        this.pages = data.pages;
        this.currentPage = data.current_page;
        this.lastPage = data.last_page;
        this.homepage = data.homepage;
        this.filters = data.filters;

        const hierarchy = this.buildHierarchy();
        this.updateFilters();
        this.renderList(hierarchy);
        this.renderPagination();
        LazySmooth.process();
    }

    findPage(id) {
        return this.pages.find(page => parseInt(page.id) === parseInt(id));
    }

    buildHierarchy() {
        const pageMap = {};
        const roots = [];

        this.pages.forEach(page => {
            page.children = [];
            pageMap[page.id] = page;
        });

        this.pages.forEach(page => {
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

    renderPagination() {
        this.pagination.innerHTML = '';

        for (let i = 1; i <= this.lastPage; i++) {
            const btn = document.createElement('button');
            btn.dataset.lazySmooth = '';
            btn.textContent = i;
            btn.disabled = i === this.currentPage;
            btn.addEventListener('click', () => this.load(i));
            this.pagination.appendChild(btn);
        }
    }

    updateFilters() {
        //ex, filters.status.published = 12
        const status = this.filters?.status || {};
        //create array of objects with value and label, value is the key and label is the key with (value)
        const statusOptions = Object.keys(status).map(key => ({
            value: key,
            label: `${key} (${status[key]})`
        }));
        this.filter_status.setOptions(statusOptions, this.selectedFilters.status);
    }

    renderRecursive(pages, depth, parentId) {
        pages.forEach((page, index) => {
            const el = Builder.div('page-item');
            el.style.marginLeft = `${depth * 20}px`;
            el.textContent = '';
            el.dataset.id = page.id;
            el.dataset.depth = depth;
            el.dataset.parentId = parentId ?? '';
            el.dataset.lazySmooth = '';
            el.dataset.lazyRight = '';

            const dragHandle = Builder.span('drag-handle');
            dragHandle.textContent = '≡';
            dragHandle.draggable = true;

            dragHandle.addEventListener('dragstart', e => this.onDragStart(e, el));
            el.addEventListener('dragover', e => this.onDragOver(e, el));
            el.addEventListener('drop', e => this.onDrop(e, el));

            const title = Builder.span('page-title');
            if (page.id === this.homepage) {
                const homeIcon = Builder.span('home-icon');
                homeIcon.textContent = '🏠';
                title.appendChild(homeIcon);
            }

            title.append(Builder.createEl('span', '', page.title || `Page #${page.id}`));

            const status = Builder.span('page-status');
            status.textContent = page.status;
            switch (page.status) {
                case 'draft':
                    status.classList.add('draft');
                    break;
                case 'published':
                    status.classList.add('published');
                    break;
                case 'archived':
                    status.classList.add('archived');
                    break;
                case 'published':
                    status.classList.add('published');
                    break;
            }

            const actions = Builder.div('page-actions');

            const editSeoBtn = Builder.button('🔍✨ Seo', 'icon-button', () => {
                window.location.href = `/admin/page/${page.id}/seo`;
            });
            editSeoBtn.dataset.tooltip = 'Editer le SEO';

            const editBtn = Builder.button('✏️', 'icon-button', () => {
                window.location.href = `/admin/page/${page.id}`;
            });
            editBtn.dataset.tooltip = 'Editer la page';

            const viewBtn = Builder.button('👁️', 'icon-button', () => {
                window.open(`/${page.slug}`, '_blank');
            });
            viewBtn.dataset.tooltip = 'Voir la page';

            const deleteBtn = Builder.button('🗑️', 'icon-button', () => {
                console.log('@todo delete');
            });
            viewBtn.dataset.tooltip = 'Supprimer la page';

            actions.appendChild(editSeoBtn);
            actions.appendChild(viewBtn);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            el.appendChild(dragHandle);
            el.appendChild(status);
            el.appendChild(title);
            el.appendChild(actions);

            this.container.appendChild(el);

            if (page.children && page.children.length > 0)
                this.renderRecursive(page.children, depth + 1, page.id);
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
        if (this.currentParentTarget) {
            this.currentParentTarget.classList.remove('can-be-parent');
            this.currentParentTarget = null;
        }

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
            // CHILD ZONE
            this.previewIndicator.dataset.position = 'child';
            target.after(this.previewIndicator);

            // Marquage du parent potentiel
            target.classList.add('can-be-parent');
            this.currentParentTarget = target;
        }
    }

    onDrop(e, target) {
        e.preventDefault();

        if (this.currentParentTarget) {
            this.currentParentTarget.classList.remove('can-be-parent');
            this.currentParentTarget = null;
        }

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

    events() {
        this.element.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-status')) {
                try {
                    const page_el = e.target.closest('.page-item');
                    if (!page_el) return;
                    const page_id = page_el.dataset.id;
                    if (!page_id) return;
                    const page = this.findPage(page_id);
                    if (!page) return;
                    this.onStatusClick(page);
                } catch (e) {
                }
            }
        })
    }

    onStatusClick(page) {
        if (!this.statusModal) {
            this.statusModal = Builder.modal(null,
                () => {
                },
                () => {
                },
            );
            document.body.appendChild(this.statusModal.element);

            const wrapper = Builder.div('container-form');
            this.statusModal.content.appendChild(wrapper);

            this.selectStatus = Builder.select(
                'Status',
                [
                    {value: 'draft', label: 'Draft'},
                    {value: 'published', label: 'Published'},
                    {value: 'private', label: 'Private'},
                    {value: 'archived', label: 'Archived'},
                ],
                page.status,
                (value) => {
                    fetch('/admin/api/page/status/' + page.id + '/' + value, {
                        method: 'POST',
                    })
                        .then(res => {
                            if (res.status === 200)
                                Toast.success('Status updated successfully');
                            else
                                Toast.error('Failed to update status');
                            this.load(-1);
                            this.statusModal.close();
                        })
                        .catch(err => {
                            console.error(err);
                            Toast.error('An error occurred while updating status');
                            this.statusModal.close();
                        });
                });

            wrapper.appendChild(this.selectStatus.getElement());
        }

        this.selectStatus.setValue(page.status);
        this.statusModal.open();
    }

    debounce(callback, delay) {
        if (this.debounceSearchTimer) clearTimeout(this.debounceSearchTimer);
        this.debounceSearchTimer = setTimeout(callback, delay);
    }
}