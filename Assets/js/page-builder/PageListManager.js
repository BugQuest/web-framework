export class PageListManager {
    constructor(element, options = {}) {
        this.element = element;
        this.currentPage = 1;
        this.lastPage = 1;
        this.perPage = 10;

        this.container = document.createElement('div');
        this.container.className = 'page-list-content';
        this.element.appendChild(this.container);

        this.pagination = document.createElement('div');
        this.pagination.className = 'page-list-pagination';
        this.element.appendChild(this.pagination);

        this.load(this.currentPage);
    }

    async load(page = 1) {
        const payload = { page, per_page: this.perPage };

        const res = await fetch('/admin/api/page/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        this.renderRecursive(pages, 0);
    }

    renderRecursive(pages, depth) {
        pages.forEach(page => {
            const el = document.createElement('div');
            el.className = 'page-item';
            el.style.marginLeft = `${depth * 20}px`;
            el.textContent = page.title || `Page #${page.id}`;
            el.dataset.id = page.id;
            this.container.appendChild(el);

            if (page.children && page.children.length > 0) {
                this.renderRecursive(page.children, depth + 1);
            }
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
