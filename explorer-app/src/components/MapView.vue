<template>
    <div class="map-wrap">
        <div class="map" ref="mapContainer"></div>
    </div>
</template>

<script lang="ts">
// Inspired by https://documentation.maptiler.com/hc/en-us/articles/4413873409809-Display-a-map-in-Vue-js-using-MapLibre-GL-JS
import 'maplibre-gl/dist/maplibre-gl.css'
import { Map, MapLayerEventType } from 'maplibre-gl';
import {defineComponent, onMounted, shallowRef, computed, PropType, watch, ref} from 'vue';
import {debounce} from 'lodash';

type MapStyle = 'dark' | 'light' | 'basic-preview';

const TILE_API = process.env.VUE_APP_EXPLORER_TILE_API;
const DEFAULT_LNG = -2.2568;
const DEFAULT_LAT = 57.0348535;
const DEFAULT_ZOOM = 12;

export default defineComponent({
    components: {
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
            });
            map1.resize();

            map.value = map1;

        })

        async function resetMap () {
            //map.value?.resize();
        }

        return { map, mapContainer, resetMap }
    }
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
</style>