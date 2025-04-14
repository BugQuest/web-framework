document.addEventListener('click', function (e) {
    const target = e.target.closest('.__dropdown_toggle');
    const dropdown = target?.closest('.__dropdown');
    document.querySelectorAll('.__dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('active');
    });
    if (dropdown) dropdown.classList.toggle('active');
});
