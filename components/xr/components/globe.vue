<template>
    <a-entity id="globe-container" 
            :position="position">
    </a-entity>

</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
    props: {
      'position': {default: '0 1.5 0'},
      },

    computed: {
        ...mapState('xr',
            [
                'sceneLoaded'
            ]
        ),
        ...mapGetters('xr',
            [
                'facetItems'
            ]
        ),
        geoCoords() {
            var coords = [];
            for (var item of this.facetItems) {
                if (typeof item.hydratedLocation != 'undefined') {
                    console.log('item.hydratedLocation.geolocation');
                    coords.push(item.hydratedLocation.geolocation);
                }
                else if (typeof item.location != 'undefined' & item.location != null) {
                    coords.push(item.location.geolocation);
                }
            }
            return coords;
        },
        geoJSONPoints() {
            return this.latlongToGeojsonPoints(this.geoCoords);
        },
        geoJSONURL() {
            return this.geoObjectToUrl(this.geoJSONPoints);
        }
    },

    methods: {

        injectGeojson : function (src) {
            // console.log('injectGeojson');
            // inject a-entity of a globe with geojson from src
            var sceneEl = document.querySelector('a-scene');
            var aContainer = document.querySelector('#globe-container');
            aContainer.innerHTML += `<a-entity id="globe-points" geometry="primitive: sphere; radius: 1;"
            material="color: #F0A;" geojson="src: #${src}; featureKey: name;"
            animation="property: rotation; easing: linear; to: 0 360; dur: 150000; loop: true;"></a-entity>`; // 
        },

        loadGeoAsset : function () {
            var self = this;

            var geosrc = this.geoObjectToUrl(this.geoJSONPoints);
            var aAssets = document.querySelector('a-assets');
            var geoItem = document.createElement("a-asset-item");
            geoItem.setAttribute('id', 'geojson-fly');
            geoItem.setAttribute('src', self.geoJSONURL);
            aAssets.appendChild(geoItem)
        },

        latlongToGeojsonPoints : function (coordinates) {
            // creates a geojson FeatureCollection of Points
            // from an array of lat/long values
            //console.log("latlongToGeojsonPoint")
            var gj = {"type": "FeatureCollection",
                    "features": []}
            var nextID = 0;
            for (var coord of coordinates) {
                var feature = {
                    "type": "Feature",
                    // must give name property for featureKey or point will not be shown
                    "properties": {"name": 'point-' + nextID++},
                    "geometry": {
                    "type": "Point",
                    "coordinates": [
                        coord[0],
                        coord[1]
                    ]
                    }
                }
                gj.features.push(feature)
            }
            return(gj)
        },


        geoObjectToUrl : function (geo) {
            var url = 'data:text/json;charset=utf8,' + encodeURIComponent(JSON.stringify(geo));
            return(url)
        }

    },
    
    mounted () {
        var self = this;
        // console.log("globe mounted");
        var sceneEl = document.querySelector('a-scene');
        if (this.sceneLoaded) {
            self.loadGeoAsset()
            self.injectGeojson('geojson-fly');
        } else {
            sceneEl.addEventListener('loaded', function () {
                self.loadGeoAsset()
                self.injectGeojson('geojson-fly');
            });
        }
    }
}
</script>