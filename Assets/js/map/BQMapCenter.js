export default class BQMapCenter {
    constructor(lat = 0, lng = 0, zoom = 20) {
        this.lat = lat;
        this.lng = lng;
        this.zoom = zoom;
    }

    toLatLng() {
        return new L.LatLng(this.lat, this.lng);
    }
}