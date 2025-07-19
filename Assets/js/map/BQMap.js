import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
/* This code is needed to properly load the images in the Leaflet CSS */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

import BQMapCenter from '@framework/js/map/BQMapCenter';
import BQMapIcon from '@framework/js/map/BQMapIcon';

export default class BQMap {
    constructor(element) {
        this.settings = {
            center: new BQMapCenter(),
            layer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
            markers: [],
            icon: new BQMapIcon(),
            options: {
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
                keyboardShortcuts: false,
                bounceAtZoomLimits: false,
                scrollWheelZoom: !L.Browser.mobile,
                zoomControl: true,
                dragging: !L.Browser.mobile,
                touchZoom: L.Browser.mobile,
                tap: !L.Browser.mobile,
            }
        }

        if (!element)
            return

        this.element = element;

        if (element.dataset.options)
            try {
                this.settings = Object.assign(this.settings, JSON.parse(element.dataset.options));
            } catch (e) {
            }

        this.loading(true)

        this.init()

        if (this.settings.markers && this.settings.markers.length)
            this.settings.markers.forEach(marker => {
                this.addMarker(marker);
            });

        this.loading(false)

        //add instance to element for easy access
        this.element.mapInstance = this;

        this.fix();
        this.element.addEventListener('resize', () => {
            this.fix();
        });

        this.autoFit('all');
    }

    init() {
        this.markers = {};

        this.map = new L.map(this.element, this.settings.options)
        this.map.addLayer(new L.tileLayer(this.settings.layer, {
            zoom: this.settings.zoom,
            attribution: this.settings.attribution
        }))
        this.map.setView(new L.LatLng(this.settings.center.lat, this.settings.center.lng), this.settings.center.zoom);

        this.markers.default = new L.FeatureGroup();
        this.map.addLayer(this.markers.default);
    }

    /**
     * Ajoute un marqueur personnalisé à la carte, dans un groupe spécifique.
     *
     * @param {Object} marker - Objet contenant les informations du marqueur à ajouter.
     *
     * Propriétés attendues dans `marker` :
     * - index (obligatoire) : identifiant unique du marqueur (utilisé pour éviter les doublons).
     * - lat : latitude du marqueur.
     * - lng : longitude du marqueur.
     * - group (optionnel) : nom du groupe auquel appartient le marqueur. Par défaut : 'default'.
     * - icon (optionnel) : URL de l'icône à utiliser. Si non défini, celle par défaut est utilisée.
     * - size (optionnel) : tableau [largeur, hauteur] définissant la taille de l'icône.
     *                      Exemple : [32, 32]. Si non fourni, la taille par défaut est utilisée.
     * - anchor (optionnel) : point d'ancrage de l'icône. Ex : [16, 32] pour l’ancrer en bas au centre.
     *                        Si non fourni, utilise celui par défaut.
     * - popup_anchor (optionnel) : point d’ancrage du popup relativement à l’icône.
     *                              Par défaut : [0, -hauteur de l'icône].
     * - icon_content (optionnel) : HTML à injecter dans un divIcon personnalisé.
     *                              Utilisé uniquement si `iconUrl` vaut `'div'`.
     * - class (optionnel) : classe CSS à appliquer au divIcon si utilisé.
     * - content (optionnel) : contenu HTML du popup à afficher sur clic.
     *
     * Fonctionnement :
     * - Si un marqueur avec le même index et groupe existe déjà, la fonction retourne immédiatement.
     * - Crée une instance Leaflet `LatLng` avec la latitude et la longitude fournies.
     * - Construit l’icône en fonction des options fournies (divIcon ou image).
     * - Crée un nouveau `L.marker` avec les options configurées.
     * - Ajoute le marqueur à un groupe spécifique sur la carte. Si le groupe n’existe pas encore,
     *   il est créé comme un `L.FeatureGroup` et ajouté à la carte.
     * - Si une fonction de rappel `onMarkerClick` est définie dans `this.settings`, elle est liée
     *   au clic sur le marqueur.
     */
    addMarker(marker) {
        let group = marker.group || 'default';

        if (this.getMarker(marker.index, group))
            return;

        let latLng = new L.LatLng(marker.lat, marker.lng);

        let icon = new BQMapIcon(
            this.settings.icon.url,
            this.settings.icon.content,
            this.settings.icon.size,
            this.settings.icon.anchor,
            this.settings.icon.popup_anchor
        );

        if (typeof marker.icon.url !== "undefined" && marker.icon.url)
            icon.url = marker.icon.url;

        if (typeof marker.icon.content !== "undefined" && marker.icon.content)
            icon.content = marker.icon.content;

        if (typeof marker.icon.size !== "undefined" && marker.icon.size && marker.icon.size.length)
            icon.size = marker.icon.size

        if (typeof marker.icon.anchor !== "undefined" && marker.icon.anchor && marker.icon.anchor.length)
            icon.anchor = marker.icon.anchor

        if (typeof marker.icon.popup_anchor !== "undefined" && marker.icon.popup_anchor && marker.icon.popup_anchor.length)
            icon.popup_anchor = marker.icon.popup_anchor

        if (typeof marker.icon.className !== "undefined" && marker.icon.className)
            icon.className = marker.icon.className;

        icon = icon.getIcon();

        let new_marker = new L.marker(latLng, {
            index: marker.index,
            alt: 'marker-' + marker.index,
            icon: icon
        });

        if (marker.content)
            new_marker.bindPopup(marker.content);

        //add marker to group if exists, otherwise create it
        if (!this.markers[group]) {
            this.markers[group] = new L.FeatureGroup();
            this.map.addLayer(this.markers[group]);
        }
        this.markers[group].addLayer(new_marker);

        if (typeof this.settings.onMarkerClick === "function")
            new_marker.on('click', (e) => {
                this.settings.onMarkerClick(e, this, new_marker.options);
            });
    }

    getMarker(index, group = 'default') {
        //check if group exists
        if (!this.markers[group]) {
            console.warn(`Group "${group}" does not exist.`);
            return null;
        }

        //check if index exists, marker.options.index is the index of the marker
        const marker = this.markers[group].getLayers().find(m => m.options.index === index);

        if (!marker) {
            // console.warn(`Marker with index "${index}" does not exist in group "${group}".`);
            return null;
        }

        return marker;
    }

    removeMarker(index, group = 'default') {
        const marker = this.getMarker(index, group);
        if (marker) {
            this.markers[group].removeLayer(marker);
            if (this.markers[group].getLayers().length === 0) {
                this.map.removeLayer(this.markers[group]);
                delete this.markers[group];
            }
        } else {
            console.warn(`Marker with index "${index}" not found in group "${group}".`);
        }
    }

    clearMarkers(group = 'all') {
        if (group === 'all') {
            for (const groupName in this.markers) {
                this.map.removeLayer(this.markers[groupName]);
            }
            this.markers = {};
        } else {
            if (this.markers[group]) {
                this.map.removeLayer(this.markers[group]);
                delete this.markers[group];
            } else {
                console.warn(`Group "${group}" does not exist.`);
            }
        }
    }

    fix() {
        this.map.invalidateSize();
    }

    flyToIndex(index, group = 'default') {
        const marker = this.getMarker(index, group);
        if (marker) {
            this.map.flyTo(marker.getLatLng(), this.map.getZoom());
        } else {
            console.warn(`Marker with index "${index}" not found in group "${group}".`);
        }
    }

    flyToMarker(marker) {
        if (marker instanceof L.Marker) {
            this.map.flyTo(marker.getLatLng(), this.map.getZoom());
        } else {
            console.warn("Provided marker is not an instance of L.Marker.");
        }
    }

    goToIndex(index, group = 'default') {
        const marker = this.getMarker(index, group);
        if (marker) {
            this.map.setView(marker.getLatLng(), this.map.getZoom());
        } else {
            console.warn(`Marker with index "${index}" not found in group "${group}".`);
        }
    }

    goToMarker(marker) {
        if (marker instanceof L.Marker) {
            this.map.setView(marker.getLatLng(), this.map.getZoom());
        } else {
            console.warn("Provided marker is not an instance of L.Marker.");
        }
    }

    autoFit(group = 'all') {
        if (group === 'all') {
            const allMarkers = Object.values(this.markers).flatMap(m => m.getLayers());
            if (allMarkers.length > 0) {
                const bounds = L.latLngBounds(allMarkers.map(m => m.getLatLng()));
                this.map.fitBounds(bounds);
            } else {
                console.warn("No markers found to fit the map.");
            }
        } else {
            const groupMarkers = this.markers[group];
            if (groupMarkers && groupMarkers.getLayers().length > 0) {
                const bounds = groupMarkers.getBounds();
                this.map.fitBounds(bounds);
            } else {
                console.warn(`Group "${group}" does not exist or has no markers.`);
            }
        }
    }

    loading(enable) {
        if (enable)
            this.element.classList.add("loading")
        else
            this.element.classList.remove("loading")
    }
}