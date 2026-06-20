document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.addEventListener('change', () => {
            const locale = langSelect.value;
            const currentPath = window.location.pathname;

            const basePath = currentPath.startsWith('/en')
                ? (currentPath.slice(3) || '/')
                : currentPath;

            window.location.href = (locale === 'en' ? '/en' : '') + basePath + window.location.search;
        });
    }
});
