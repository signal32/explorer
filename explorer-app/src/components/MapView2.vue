<template>
    <div class="map-wrapper">
        <div class="map" ref="container"></div>
        <div v-if="isLoading" style="position: absolute; top: -1px; height: 0px; width: 100%">
            <IonProgressBar type="indeterminate"></IonProgressBar>
        </div>




        <div style="padding: 10px; position:absolute; bottom: 20px; width: 100%">
            <Transition>
            <IonItem v-if="detailedLoading.loading" style="border-radius: 50pc; margin: 5px">
                {{ detailedLoading.text }}
                <IonSpinner slot="end"></IonSpinner>
            </IonItem>
            </Transition>
            <Transition>
            <IonItem v-if="bottomMessage.show" style="border-radius: 50pc; margin: 5px">
                {{ bottomMessage.text }}
            </IonItem>
            </Transition>
        </div>
        <div style="position: absolute; bottom: 13px; height: 10px; width: 100%; text-align: right; padding-right: 5px; font-size: 10px; color: grey">
            <p>Data © OpenMapTiles © OpenStreetMap contributors</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import {IonItem, IonProgressBar, IonSpinner} from '@ionic/vue';
import {computed, defineEmits, defineProps, onMounted, PropType, ref, shallowRef, watch} from 'vue';
import 'maplibre-gl/dist/maplibre-gl.css'
import {GeoEntity} from '@/modules/geo/entity';
import {debounce} from 'lodash';
import {GeoJSONSource, LayerSpecification, LngLat, Map} from 'maplibre-gl';
import {Feature, FeatureCollection, Geometry} from 'geojson';
import {toFeatureCollection} from '@/modules/geo/geoJson';
import {services} from '@/modules/app/services';
import {NotificationType} from '@/modules/app/notification';
import {LatLng, LatLngBounds} from '@/modules/geo/types';
import darkIcon from '@/assets/icons/dark.png';
import {geolocationService} from '@/modules/app/geolocationService';
import {Geolocation} from '@awesome-cordova-plugins/geolocation';
import {Geoposition} from '@awesome-cordova-plugins/geolocation/ngx';
//import darkIcon from '@/assets/icons/dark.appiconset/dark_128.png';



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
    const ENTITY_SOURCE_ID = 'explorer_entity_source';
    const LOCATION_LAYER_ID = 'explorer_location';
    const LOCATION_SOURCE_ID = 'explorer_location_source';

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

    //-- MAP IMAGES
    const images = [
        {id: 'pin-normal', url: (props.style == "dark" )? require('@/assets/icons/dark.png') : require('@/assets/icons/light.png')},
        {id: 'pin-selected', url: (props.style == "dark" )? require('@/assets/icons/dark_selected.png') : require('@/assets/icons/light_selected.png')},
        {id: 'location', url:require('@/assets/icons/location.png')},
    ]

    //-- SELECTED LAYER DEFINITION
    const selectedLayerSpec: LayerSpecification = {
        id: SELECTED_LAYER_ID,
        source: SELECTED_SOURCE_ID,
        type: 'symbol',
        layout: {
            "text-field": ['get', 'name'],
            "text-size": 12,
            "symbol-z-order": "source",
            "icon-image": 'pin-selected',
            "icon-size": 0.04,
            'text-offset': [1.5, 0],
            'text-anchor': 'left'
        },
        paint: {
            "text-color": (props.style == "dark" )? "#cc0f05" : "#EA4335",
            "text-halo-blur": 0.5,
            "text-halo-color": (props.style == "dark" )? "#4b4b4b" : "#666666",
            "text-halo-width": 0.5,
            "icon-halo-blur": 0.5,
            "icon-halo-color": (props.style == "dark" )? "#4b4b4b" : "#666666",
            "icon-halo-width": 0.5,

        },
    };

    //-- ENTITY LAYER DEFINITION
    const entityLayerSpec: LayerSpecification = {
        id: ENTITY_LAYER_ID,
        source: ENTITY_SOURCE_ID,
        type: 'symbol',
        layout: {
            "text-field": ['get', 'name'],
            "text-size": 12,
            "symbol-spacing": 1000,
            "icon-image": 'pin-normal',
            "icon-size": 0.04,
            'text-offset': [1.5, 0],
            'text-anchor': 'left'
        },
        paint: {
            "text-color": (props.style == "dark" )? "#a0a0a0" : "#666666"
        },
        minzoom: 12,
    };

    const locationLayerSpec: LayerSpecification = {
        id: LOCATION_LAYER_ID,
        source: LOCATION_SOURCE_ID,
        type: 'symbol',
        layout: {
            "symbol-spacing": 1000,
            "icon-image": 'location',
            "icon-size": 0.04,
        },
        paint: {
        },

    };
    /// Reference to main map object, initialised when component is mounted.
    const map = shallowRef<Map>();
    /// Reference to html div container element for map
    const container = shallowRef('');
    /// Tracks whether the map is in some loading state or not
    const isLoading = ref(false);

    const detailedLoading = ref({
        loading: false,
        text: ''
    });
    const bottomMessage = ref({
        show: false,
        text: '',
    })

    /// Position at which map was last updated
    let lastUpdateCenter = new LngLat(0.0, 0.0);

    /// Debounce updatePosition event to prevent race conditions and feedback loops.
    const updateExternalPosition = debounce(async () => {
        const {lng, lat} = map.value?.getCenter() || DEFAULT_POSITION;
        const zoom = map.value?.getZoom() || DEFAULT_POSITION.zoom;
        const newPosition = {lng, lat, zoom};

        if (JSON.stringify(props.position) !== JSON.stringify(newPosition)) {
            emits('updatePosition', newPosition);
        }
    }, 500);


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

            // Layer for gps location marker
            map.value?.addSource(LOCATION_SOURCE_ID, {
                type: 'geojson',
                data: DEFAULT_FEATURES,
            });

            map.value?.addLayer(entityLayerSpec);
            map.value?.addLayer(selectedLayerSpec);
            map.value?.addLayer(locationLayerSpec);

            loadImages();

            update();
        })

        // Emit new map position after moving
        map.value.on('moveend', () => {
            updateExternalPosition();
        });

        // Update map after move completes and new area is in focus
        // This is quite a basic check but works surprisingly well in most cases.
        map.value.on('moveend', () => {
            if (!map.value?.getBounds().contains(lastUpdateCenter)) {
                update();
                lastUpdateCenter = map.value?.getCenter() || new LngLat(0.0, 0.0);
            }
            const zoom = map.value?.getZoom() || 0;
            if (zoom < 13) {
                bottomMessage.value.show = true;
                bottomMessage.value.text = 'Zoom in to see details';
            }
            else bottomMessage.value.show = false;
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
                emits('updatePosition', {zoom: map.value?.getZoom(), ...JSON.parse(feature.properties?.position)} || DEFAULT_POSITION )

            }
        })

        // Register click event for layers (used for place/area names)
        for (const layer of SELECTABLE_LAYERS) {
            map.value.on('click', layer, async event => {
                if (event.features) {
                    const name = event.features[0].properties?.name || '';
                    const category = event.features[0].properties?.class;
                    const position: LngLat = (event.features[0].geometry.type == 'Point')
                        ? new LngLat(event.features[0].geometry.coordinates[0], event.features[0].geometry.coordinates[1])
                        : event.lngLat;
                    detailedLoading.value.loading = true;
                    detailedLoading.value.text = `Finding details for ${name}`
                    try {
                        const entity = await findEntity(name,category, position);
                        entity.position = position;

                        detailedLoading.value.loading = false;
                        emits('selected', entity);
                        emits('updatePosition', {zoom: map.value?.getZoom(), ...position} || DEFAULT_POSITION )
                    }
                    catch (e) {
                        console.log(e);
                        detailedLoading.value.loading = false;
                        services.notificationService.pushNotification({
                            title: 'Nothing found',
                            description: `We were unable to find anything about ${name}.`,
                            type: NotificationType.TOAST,
                        })
                    }
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

    const locationWatch = Geolocation.watchPosition({maximumAge: 40000000});
    locationWatch.subscribe((data => {
        if ('coords' in data) {
            //console.log(`New location ${data.coords.latitude} ${data.coords.longitude}`)

            const newLocation = DEFAULT_FEATURES;
            newLocation.features = [{
                geometry: {
                    type: 'Point',
                    coordinates: [data.coords.longitude, data.coords.latitude],
                },
                properties: {id: '', name: '', position: {lat: 0, lng: 0}}, type: 'Feature'
            }];
            (map.value?.getSource(LOCATION_SOURCE_ID) as any).setData(newLocation, map.value?.getZoom());
        }
        else console.error(data);
    }));

    /// Fetch and update map entity data
    async function update() {
        const zoom = map.value?.getZoom();
        if (zoom && zoom < 13) {
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

    async function findEntity(name: string, type: string, position: LngLat): Promise<GeoEntity> {
        const categories = await services.categoryService.methods.searchCategoryLabels(type);
        if (type =='village') categories.push(... await services.categoryService.methods.searchCategoryLabels('town'))
        console.debug(`Categories deduced for type=${type}:`, categories);
        const result = await services.queryService.methods.getByArea(LatLngBounds.fromMapBox(position.toBounds(1000)), categories, name, false);
        const feature = result.features.find(i => {
            return i.properties.name.toLowerCase().match(name.toLowerCase());
        });
        if (feature) return feature.properties;
        else return Promise.reject('No matching entity found');
    }

    function loadImages() {
        images.forEach(imageDescription => {
            console.log(imageDescription.url);
            map.value?.loadImage(imageDescription.url, function(error, image) {
                if (error) throw error;
                if (!map.value?.hasImage(imageDescription.id) && image) {
                    map.value?.addImage(imageDescription.id, image, {content: [16, 16, 300, 384]});
                }
            });
        })
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

.overlay {
    position: absolute;
    width: 100%;
    height: 80%;
    display: flex;
    justify-content: left;
    flex-direction: column;
    text-align: left;
    margin: 13% 0;
    min-height: 300px;
}

.v-enter-active,
.v-leave-active {
    transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}

</style>