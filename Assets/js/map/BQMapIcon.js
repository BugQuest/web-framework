import L from 'leaflet';

export default class BQMapIcon {
    constructor(url = 'div',
                content = '<div class="marker-icon"></div>',
                size = [40, 40],
                anchor = [20, 20],
                popup_anchor = [0, -20],
                className = 'bq-map-icon') {
        this.url = url;
        this.content = content;
        this.size = size;
        this.anchor = anchor;
        this.popup_anchor = popup_anchor;
        this.className = className
    }

    getIcon() {
        if( this.url === 'div' ) {
            return L.divIcon({
                className: this.className,
                html: this.content,
                iconSize: this.size,
                iconAnchor: this.anchor,
                popupAnchor: this.popup_anchor
            });
        }

        return L.icon({
            iconUrl: this.url,
            iconSize: this.size,
            iconAnchor: this.anchor,
            popupAnchor: this.popup_anchor
        });
    }
}