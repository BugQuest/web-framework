import Builder from '@framework/js/services/Builder';
import MediaGallery from '@framework/js/components/MediaGallery'

export default class MediaPicker {
    static modal = null;
    static gallery = null;

    static open(options = {}, onSelect = null) {
        if (!this.modal) {
            this.modal = Builder.modal(
                null,
                () => {
                },
                () => {
                }
            );
            this.modal.content.dataset.canUpload = 'true';

            document.body.appendChild(this.modal.element);

            this.gallery = new MediaGallery(this.modal.content);
        }

        this.gallery.forced_mimeTypes = options.mimeTypes || [];
        this.gallery.forced_tags = options.tags || [];
        this.gallery.onClickItem = (media) => {
            if (typeof onSelect === 'function')
                onSelect(media);

            this.modal.close();
        };

        this.modal.open();
        this.gallery.loadTags();
        this.gallery.loadPage();
    }
}