const overlay = document.getElementById('media-upload-overlay');
const uploadText = document.getElementById('upload-text');
const mediaGrid = document.querySelector('.__mediaGrid')
let updateMessage = true

const messages = [
    "Fente quantique disponible. Insérer fichiers maintenant.",
    "Analyse des paquets…",
    "Drop zone activée. Initier le transfert.",
    "Drag’n’drop engagé. Fichiers prêts à être absorbés.",
    "Téléversement en cours d’initialisation…"
];

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    overlay.classList.add('active');
    if (updateMessage) {
        updateMessage = false;
        uploadText.textContent = messages[Math.floor(Math.random() * messages.length)];
    }
});

document.addEventListener('dragleave', (e) => {
    if (e.relatedTarget === null || !overlay.contains(e.relatedTarget)) {
        overlay.classList.remove('active');
    }
    updateMessage = true;
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    overlay.classList.remove('active');
    updateMessage = true;
    const files = [...e.dataTransfer.files];
    for (const file of files) {
        uploadFile(file);
    }
});

function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const card = document.createElement('div');
    card.className = 'media-card';
    card.innerHTML = `
        <div class="preview">${getPreview(file)}</div>
        <div class="progress-bar"></div>
    `;
    mediaGrid.prepend(card);

    const progressBar = card.querySelector('.progress-bar');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/admin/medias/upload');

    xhr.upload.onprogress = e => {
        const percent = Math.floor((e.loaded / e.total) * 100);
        progressBar.style.width = percent + '%';
    };

    xhr.onload = () => {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            const isImage = response.mime.startsWith('image/');

            card.innerHTML = `
                <div class="preview">
                    ${isImage ? `<img src="${response.url}" alt="${response.name}">` : `<div class="media-icon">📄</div>`}
                </div>
                <div class="name">${response.name}</div>
            `;
        } else {
            card.innerHTML = `<div class="error">❌ Upload failed</div>`;
        }
    };

    xhr.onerror = () => {
        card.innerHTML = `<div class="error">❌ Erreur réseau</div>`;
    };

    xhr.send(formData);
}

function getPreview(file) {
    if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        return `<img src="${url}" alt="preview">`;
    }

    return `<div class="media-icon">📄</div>`;
}
