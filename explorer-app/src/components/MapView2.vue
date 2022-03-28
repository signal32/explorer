<template>
    <div class="map-wrapper">
        <div class="map" ref="container"></div>
        <div v-if="isLoading" style="position: absolute; top: -1px; height: 0px; width: 100%">
            <IonProgressBar type="indeterminate"></IonProgressBar>
        </div>
        <div style="position: absolute; bottom: 13px; height: 10px; width: 100%; text-align: right; padding-right: 5px; font-size: 10px; color: grey">
            <p>Data © OpenMapTiles © OpenStreetMap contributors</p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {IonProgressBar} from '@ionic/vue';
    import {defineEmits, defineProps} from 'vue';
    import 'maplibre-gl/dist/maplibre-gl.css'
    import {computed, onMounted, PropType, ref, shallowRef, watch} from 'vue';
    import {GeoEntity} from '@/modules/geo/entity';
    import {debounce} from 'lodash';
    import {GeoJSONSource, LayerSpecification, LngLat, Map} from 'maplibre-gl';
    import {Feature, FeatureCollection, Geometry} from 'geojson';
    import {toFeatureCollection} from '@/modules/geo/geoJson';
    import {services} from '@/modules/app/services';
    import {NotificationType} from '@/modules/app/notification';
    import {LatLngBounds} from '@/modules/geo/types';

    /// Map rendering style
    export declare type MapStyle = 'light' | 'dark';

    /// Focus of map camera
    export type MapPosition = {lng: number, lat: number, zoom?: number}
    const DEFAULT_POSITION = {lng: 0.0, lat: 0.0, zoom: 15};

    const DEFAULT_FEATURES: FeatureCollection<Geometry, GeoEntity> = {
        type: 'FeatureCollection',
        features: new Array<Feature<Geometry, GeoEntity>>()
    }

    /// Layers which can be selected
    const SELECTABLE_LAYERS = ['place_village','place_suburb' , 'place_town', 'place_city', 'place_city_large', 'place_capital'];

    const SELECTED_LAYER_ID = 'explorer_selected';
    const SELECTED_SOURCE_ID = 'explorer_selected_source'
    const ENTITY_LAYER_ID = 'explorer_entity';
    const ENTITY_SOURCE_ID = 'explorer_entity_source'

    /// Endpoint serving map vector tiles
    const TILE_API = process.env.VUE_APP_EXPLORER_TILE_API;



    //-- COMPONENT PROPERTY DEFINITIONS
    const props = defineProps({
        position:{
            type: Object as PropType<MapPosition>,
            required: true,
        } ,
        style: {
            type: String as PropType<MapStyle>,
            required: true,
            //default: 'light',
        },
        selected: {
            type: Object as PropType<GeoEntity[]>,
            default: [] as GeoEntity[],
        }
    });

    //-- COMPONENT EVENT EMITTERS
    const emits = defineEmits({
        selected: (selected: GeoEntity) =>{return {selected}},
        updatePosition: (position: MapPosition) => {return position},
    });

    //-- SELECTED LAYER DEFINITION
    const selectedLayerSpec: LayerSpecification = {
        id: SELECTED_LAYER_ID,
        source: SELECTED_SOURCE_ID,
        type: 'symbol',
        layout: {
            "text-field": ['get', 'name'],
            "text-size": 14,
            "symbol-z-order": "source",
        },
        paint: {
            "text-color": (props.style == "dark" )? "#cc0f05" : "#EA4335",
            "text-halo-blur": 0.5,
            "text-halo-color": (props.style == "dark" )? "#4b4b4b" : "#666666",
            "text-halo-width": 0.5
    }
    };

    //-- ENTITY LAYER DEFINITION
    const entityLayerSpec: LayerSpecification = {
        id: ENTITY_LAYER_ID,
        source: ENTITY_SOURCE_ID,
        type: 'symbol',
        layout: {
            "text-field": ['get', 'name'],
            "text-size": 12,
            "symbol-spacing": 400,
        },
        paint: {
            "text-color": (props.style == "dark" )? "#a0a0a0" : "#666666"
        }
    };

    /// Debounced position to prevent race conditions. Should be used by all internal logic.
    const safePosition = computed({
        get: () => props.position,
        set: (value) => debounce(async() => emits('updatePosition', value), 300)
    });

    /// Reference to main map object, initialised when component is mounted.
    const map = shallowRef<Map>();
    /// Reference to html div container element for map
    const container = shallowRef('');
    /// Tracks whether the map is in some loading state or not
    const isLoading = ref(false);
    /// Position at which map was last updated
    let lastUpdateCenter = new LngLat(0.0, 0.0);

    // Setup map
    onMounted(() => {
        map.value = new Map({
            container: container.value,
            style: `${TILE_API}styles/${props.style}/style.json`,
            center: props.position,
            zoom: props.position?.zoom || DEFAULT_POSITION.zoom,
            attributionControl: false,
        })

        map.value.on('load', () => {
            map.value?.resize(); // Required to auto-fit viewport on some browsers

            // Layer for all entities
            map.value?.addSource(ENTITY_SOURCE_ID, {
                type: 'geojson',
                data: DEFAULT_FEATURES,
            });

            // Layer for any selected entity or item
            map.value?.addSource(SELECTED_SOURCE_ID, {
                type: 'geojson',
                data: DEFAULT_FEATURES,
            });

            map.value?.addLayer(entityLayerSpec);
            map.value?.addLayer(selectedLayerSpec);

            update();
        })

        // Emit new map position after moving
        map.value.on('moveend', () => {
            const {lng, lat} = map.value?.getCenter() || DEFAULT_POSITION;
            const zoom = map.value?.getZoom() || DEFAULT_POSITION.zoom;
            const newPosition = {lng, lat, zoom};

            if (JSON.stringify(props.position) !== JSON.stringify(newPosition)) {
                emits('updatePosition', newPosition);
            }
        });

        // Update map after move completes and new area is in focus
        // This is quite a basic check but works surprisingly well in most cases.
        map.value.on('moveend', () => {
            if (!map.value?.getBounds().contains(lastUpdateCenter)) {
                update();
                lastUpdateCenter = map.value?.getCenter() || new LngLat(0.0, 0.0);
            }
        });


        // Fire select event when an entity is selected
        map.value.on('click', ENTITY_LAYER_ID, event => {
            const feature  = event?.features?.[0];
            if (feature) {
                emits('selected', {
                    id: feature.properties?.id || 'no-id',
                    name: feature.properties?.name || '',
                    position: JSON.parse(feature.properties?.position) || DEFAULT_POSITION,
                    ...feature.properties,
                });
                emits('updatePosition', {zoom: 15, ...JSON.parse(feature.properties?.position)} || DEFAULT_POSITION )

            }
        })

        // Register click event for layers (used for place/area names)
        for (const layer of SELECTABLE_LAYERS) {
            map.value.on('click', layer, event => {
                if (event.features) {
                    const place= {
                        id: event.features[0].properties?.id || 'no-id',
                        name: event.features[0].properties?.name || '',
                        position: (event.features[0].geometry.type == 'Point' ) ? {
                            lng: event.features[0].geometry.coordinates[0],
                            lat: event.features[0].geometry.coordinates[1]
                        } : DEFAULT_POSITION,
                    ...event.features[0].properties,
                    };
                    console.debug('Selected abstract place:', place);
                    emits('selected', place);
                }
            })
        }

        console.debug('Map initialisation complete');
    })

    // Update selected entities when changed
    watch(computed(() => {return props.selected}), (now, prev) => {
        if (map.value?.getSource(SELECTED_SOURCE_ID)?.type == 'geojson'){
            const source = map.value?.getSource(SELECTED_SOURCE_ID) as GeoJSONSource;
            const x = toFeatureCollection(now);
            source.setData(x);
        }
    })

    // Move the map to new position. The 'computed' should not be needed but is for some reason...
    watch(computed(() => {return props.position}), (now, prev) => {
        const center = map.value?.getCenter() || DEFAULT_POSITION;
        if (now && prev && (Math.abs(now.lng - center.lng) > 0.01 || Math.abs(now.lat - center.lat) > 0.001)) {
            map.value?.flyTo({
                center: [now.lng, now.lat],
                zoom: now?.zoom || 0,
                speed: 2.0,
                curve: 1,
            });
        }
    })

    /// Fetch and update map entity data
    async function update() {
        const zoom = map.value?.getZoom();
        if (zoom && zoom < 13) {
            services.notificationService.pushNotification({
                title: 'Zoom in to update map',
                description: 'Automatic search over large areas is currently disabled.',
                type: NotificationType.TOAST
            })
            return;
        }

        if (map.value?.getSource(ENTITY_SOURCE_ID)) {
            isLoading.value = true;
            services.queryService.methods.getByArea(LatLngBounds.fromMapBox(map.value?.getBounds()))
                .then( data => {
                    (map.value?.getSource(ENTITY_SOURCE_ID) as any).setData(data, map.value?.getZoom());
                    isLoading.value = false;
                });
        }
    }

    async function orientate() {
        map.value?.resetNorthPitch();
    }



</script>

<style scoped>
@import '~maplibre-gl/dist/maplibre-gl.css';

.map-wrapper {
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