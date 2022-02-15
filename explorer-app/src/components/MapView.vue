<template>
    <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button v-if="details.bearing !== 0" color="light" @click="orientate()">
            <ion-icon class="compass-icon" :icon="navigateSharp"></ion-icon>
        </ion-fab-button>
        <ion-fab-button color="light" @click="resetMap()">
            <ion-icon class="compass-icon" :icon="hammerSharp"></ion-icon>
        </ion-fab-button>
        <ion-fab-button color="light" @click="updateMap()">
            <ion-icon class="compass-icon" :icon="searchSharp"></ion-icon>
        </ion-fab-button>
    </ion-fab>

    <div class="map-wrap">
        <div class="map" ref="mapContainer"></div>
    </div>
</template>

<script lang="ts">
// Inspired by https://documentation.maptiler.com/hc/en-us/articles/4413873409809-Display-a-map-in-Vue-js-using-MapLibre-GL-JS
import 'maplibre-gl/dist/maplibre-gl.css'
import {LngLat, Map} from 'maplibre-gl';
import {computed, defineComponent, onMounted, PropType, ref, shallowRef, watch} from 'vue';
import {debounce} from 'lodash';
import {IonFab, IonFabButton, IonIcon} from '@ionic/vue';
import {hammerSharp, navigateSharp, searchSharp} from 'ionicons/icons';
import {defineQueryPluginManager} from '@/modules/query/pluginManager';
import {defineWikiDataPlugin} from '@/modules/query/WikidataPlugin';
import {LatLngBounds} from '@/modules/geo/types';

type MapStyle = 'dark' | 'light' | 'basic-preview';

const TILE_API = process.env.VUE_APP_EXPLORER_TILE_API;
const DEFAULT_LNG = -2.2568;
const DEFAULT_LAT = 57.0348535;
const DEFAULT_ZOOM = 12;

const wikidataPlugin = defineWikiDataPlugin({sparqlEndpoints: ['https://query.wikidata.org/sparql'], });
const geoQueryService = defineQueryPluginManager([wikidataPlugin]);

export default defineComponent({
    components: {
        IonFab,
        IonFabButton,
        IonIcon
    },

    props: {
        position: Object as PropType<MapPosition>,
        style: Object as PropType<MapStyle>
    },

    emits: ['update:position'],

    setup(props, {emit}) {
        const mapContainer = shallowRef("");
        const map = shallowRef<Map>();
        const style = props.style || `basic-preview`;
        const position = ref<MapPosition>({
            lng: DEFAULT_LNG, lat: DEFAULT_LAT, zoom: DEFAULT_ZOOM
        });
        let lastUpdateCenter = new LngLat(0.0, 0.0);

        const details = ref({
            bearing: 0
        });

        const updateExternalPosition = debounce(async () => {
            _position.value = position.value;
        }, 300);

        const _position = computed({
            get: () => props.position,
            set: (value) => {
                emit(`update:position`, value);
            }
        });

        // If position is changed externally, we animate to the new position.
        // Simple non-euclidean distance checks help to avoid introducing race conditions for small movements.
        watch(_position, (now, prev) => {
            if (now && prev && (Math.abs(now.lng - position.value.lng) > 0.000 || Math.abs(now.lat - position.value.lat) > 0.000)) {
                map.value?.flyTo({
                    center: [now.lng, now.lat],
                    zoom: now?.zoom || 0,
                    speed: 2.0,
                    curve: 1,
                });
            }
        })

        onMounted(() => {
            console.log("mounted")
            const map1 = new Map({
                container: mapContainer.value,
                style: `${TILE_API}styles/${style}/style.json`,
                center: [_position.value?.lng || DEFAULT_LNG, _position.value?.lat || DEFAULT_LAT],
                zoom: _position.value?.zoom || DEFAULT_ZOOM,
            });
            map1.on('load', () => map1.resize());

            map1.on('moveend', () => {
                const { lng, lat} = map1.getCenter();
                const zoom = map1.getZoom();
                const newPos = {lng, lat, zoom};
                if (JSON.stringify(position.value) !== JSON.stringify(newPos)) {
                    position.value = newPos;
                    updateExternalPosition();
                }
                details.value.bearing = map1.getBearing() || 0

                if (!map1.getBounds().contains(lastUpdateCenter)) {
                    console.log('Radius of viewport: ' + map1.getCenter().distanceTo(map1.getBounds().getNorthEast()));
                    //updateMap();
                    lastUpdateCenter = map1.getCenter();
                }

            });

            map1.on('load', () => {
                geoQueryService.getAbstractArea(LatLngBounds.fromMapBox(map1.getCenter().toBounds(500)))
                    .then( data => {
                        map1.addSource('wikidata', {
                            type: 'geojson',
                            data:  data});

                        map1.addLayer({
                            id: 'wikidata',
                            type: 'symbol',
                            source: 'wikidata',
                            layout: {
                                "text-field": ['get', 'name'],
                            },
                            paint: {
                                "text-color": "#ffffff"
                            }
                        })
                    })
/*                map1.addSource('wikidata', {
                    type: 'geojson',
                    data:  GisService.getGeoJson(map1.getCenter(), map1.getZoom())
                    //data: JSON.parse("{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[-2.3713666,57.2827122]},\"properties\":{}}]}")
                });*/
                //map1.showTileBoundaries = true;

                //map1.getSource('wikidata')?.tileID

            });



            map1.on('moveend', () => {

                // TODO Improve type safety when https://github.com/maplibre/maplibre-gl-js/issues/785 is resolved
                if ((map1.getSource('wikidata'))) {
                    //(map1.getSource('wikidata') as any).setData(GisService.getGeoJson(map1.getCenter(), map1.getZoom()));
                }
            })

            map1.resize();

            map.value = map1;

        })

        async function resetMap () {
            map.value?.resize();
        }

        async function updateMap() {
            if ((map.value?.getSource('wikidata'))) {
                geoQueryService.getAbstractArea(LatLngBounds.fromMapBox(map.value?.getCenter().toBounds(500)))
                    .then( data => {
                        (map.value?.getSource('wikidata') as any).setData(data, map.value?.getZoom());
                    });

            }
        }

        async function orientate() {
            map.value?.resetNorthPitch();
        }

        const x = map.value?.getBearing()
        return { map, mapContainer, resetMap, orientate, updateMap, navigateSharp, hammerSharp, searchSharp, details}
    },
});

export interface MapPosition {
    lng: number,
    lat: number,
    zoom?: number,
}
</script>

<style scoped>
@import '~maplibre-gl/dist/maplibre-gl.css';

.map-wrap {
    position: relative;
    width: 100%;
    height: 100%  /* calculate height of the screen minus the heading: calc(100vh - 77px);*/
}

.map {
    position: absolute;
    width: 100%;
    height: 100%;
}

.compass-icon {
    rotate: v-bind(details.bearing + "deg") !important;
    animation: ease;
}

</style>