import leaflet from 'leaflet';

class Map {
    constructor(element) {
        this.settings = {
            center: [0, 0],
            zoom: 20,
            layer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
            markers: [],
            icon: {
                url: 'div',
                content: '<div class="marker-icon"></div>',
                size: [40, 40],
                anchor: [20, 20],
            },
            leafletOptions: {
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
    }

    init() {
        this.center = new L.LatLng(this.settings.center[0], this.settings.center[1]);

        this.markers = {};

        this.map = new L.map(this.element, this.settings.leafletOptions)
        this.map.addLayer(new L.tileLayer(this.settings.layer, {
            zoom: this.settings.zoom,
            attribution: this.settings.attribution
        }))
        this.map.setView(this.center, this.settings.zoom);

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

        let icon = null

        let iconSize = this.settings.default_icon.size
        if (typeof marker.size !== "undefined" && marker.size && marker.size.length)
            iconSize = marker.size

        let iconAnchor = this.settings.default_icon.anchor
        if (typeof marker.anchor !== "undefined" && marker.anchor && marker.anchor.length)
            iconAnchor = marker.anchor

        let popupAnchor = [0, -iconSize[1]]
        if (typeof marker.popup_anchor !== "undefined" && marker.popup_anchor && marker.popup_anchor.length)
            popupAnchor = marker.popup_anchor

        if (iconUrl === 'div') {
            let icon_data = {
                html: this.settings.default_icon.content,
                iconSize: iconSize,
                iconAnchor: iconAnchor,
                popupAnchor: popupAnchor,
            }

            if (typeof marker.icon_content != "undefined")
                icon_data.html = marker.icon_content

            if (typeof marker.class != "undefined")
                icon_data.className = marker.class

            icon = new L.divIcon(icon_data)
        } else {
            let iconUrl = this.settings.default_icon.url
            if (typeof marker.icon !== "undefined" && marker.icon)
                iconUrl = marker.icon

            icon = L.icon({
                iconUrl: iconUrl,
                iconSize: iconSize,
                iconAnchor: iconAnchor,
                popupAnchor: popupAnchor
            })
        }

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
            console.warn(`Marker with index "${index}" does not exist in group "${group}".`);
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