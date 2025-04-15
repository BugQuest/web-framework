document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.addEventListener('change', () => {
            const locale = langSelect.value;
            document.cookie = `bq_locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
            location.reload();
        });
    }
});
