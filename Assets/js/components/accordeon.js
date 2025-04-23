document.addEventListener('click', function (e) {
    const target = e.target.closest('.__AccordeonTitle');
    if (target) {
        const accordeon = target.closest('.__Accordeon');
        accordeon?.classList.toggle('active');
    }
});