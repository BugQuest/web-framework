document.addEventListener('click', function (e) {
    const target = e.target.closest('.__accordeon_title');
    if (target) {
        const accordeon = target.closest('.__accordeon');
        accordeon?.classList.toggle('active');
    }
});