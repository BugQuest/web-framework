import Gallery from './Gallery.js';

export default class MediaUploader {
    constructor(
        dropZoneSelector = '#media-upload-overlay',
        gridSelector = '.__mediaGrid',
        uploadUrl = '/admin/medias/upload'
    ) {
        this.overlay = document.querySelector(dropZoneSelector);
        this.mediaGrid = document.querySelector(gridSelector);
        this.uploadUrl = uploadUrl;
        this.gallery = Gallery; // correction ici

        this.initEvents();
    }

    initEvents() {
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.overlay.classList.add('active');
        });

        document.addEventListener('dragleave', (e) => {
            if (e.relatedTarget === null || !this.overlay.contains(e.relatedTarget)) {
                this.overlay.classList.remove('active');
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            this.overlay.classList.remove('active');
            const files = [...e.dataTransfer.files];
            for (const file of files) {
                this.uploadFile(file);
            }
        });
    }

    uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const tempCard = document.createElement('div');
        tempCard.className = '__mediaCard uploading';
        tempCard.innerHTML = `
            <div class="__mediaCard__Preview">${this.getPreviewHTML(file)}</div>
            <div class="progress-bar"></div>
        `;
        this.mediaGrid.prepend(tempCard);

        const progressBar = tempCard.querySelector('.progress-bar');

        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.uploadUrl);

        xhr.upload.onprogress = (e) => {
            const percent = Math.floor((e.loaded / e.total) * 100);
            progressBar.style.width = percent + '%';
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    this.gallery.replaceCardWithMedia(tempCard, response);
                } catch (err) {
                    tempCard.innerHTML = `<div class="error">❌ Réponse invalide</div>`;
                }
            } else {
                tempCard.innerHTML = `<div class="error">❌ Upload échoué</div>`;
            }
        };

        xhr.onerror = () => {
            tempCard.innerHTML = `<div class="error">❌ Erreur réseau</div>`;
        };

        xhr.send(formData);
    }

    getPreviewHTML(file) {
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            return `<img src="${url}" alt="preview">`;
        }
        return `<div class="__mediaCard__Icon">📄</div>`;
    }
}
