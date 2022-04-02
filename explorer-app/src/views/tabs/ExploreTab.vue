<template>
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Explore</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
        <IonItem color="tertiary" @click.ctrl="showMap = !showMap">
            <ion-icon slot="start" :icon="location"></ion-icon>
            <IonLabel>
                <h1>Places {{mode}} {{originEntity?.name}}</h1>
                <h6 v-if="originEntity?.id == 'corral_user_position'">Showing places up to {{distance/1000}}km away.</h6>
            </IonLabel>
        </IonItem>

        <div v-if="showMap" style="height: 250px">
            <MapView2 :selected="[originEntity]" :position="{lng: originEntity?.position.lng, lat: originEntity?.position.lat, zoom: 12.5}" :style="'dark'" :key="originEntity"/>
        </div>

<!--        <ion-item>
            <IonLabel slot="start">Filter</IonLabel>
            <IonButton color="light">Images only</IonButton>
            <IonButton slot="end"> Search nearby</IonButton>
        </ion-item>-->

        <LocationGrid v-if="sortedEntities.length > 0" :entities="sortedEntities"/>
        <ion-progress-bar v-else type="indeterminate"></ion-progress-bar>

<!--        <p v-for="relatedEntity in relatedEntities" :key="relatedEntity">{{relatedEntity.name}}</p>-->
    </IonContent>
  </IonPage>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonIcon, IonProgressBar, IonButton } from '@ionic/vue';
import {location} from 'ionicons/icons';
import {computed, ref, watch} from 'vue';
import {services} from '@/modules/app/services';
import router from '@/router';
import {Entity, GeoEntity} from '@/modules/geo/entity';
import MapView2 from '@/components/MapView2.vue';
import LocationGrid from '@/components/LocationGrid.vue';
import {Geolocation} from '@awesome-cordova-plugins/geolocation';
import {LngLat} from 'maplibre-gl';
import {LatLngBounds} from '@/modules/geo/types';

/**
 * Within: Show places that are within the provided entities' location
 * Nearby: Show places that are near, but not necessarily within provided entities location
 */
type ExploreMode = 'within' | 'nearby';

// Entity to 'explore' around
const originEntity = ref<GeoEntity>();
// Entities that are related to the base entity
const relatedEntities = ref<GeoEntity[]>([]);
// Whether map should be displayed
const showMap = ref(false);
// Radius distance in meters from origin in which to search
const distance = computed(() => {
    const distanceParam = router.currentRoute.value.query?.distance as string || undefined;
    if (distanceParam) return parseFloat(distanceParam);
    else return 500;
})
// Active mode, should default to nearby as this is most likely to work well
const mode = computed<ExploreMode>(() => {
    const modeParam = router.currentRoute.value.query?.mode as string || undefined;
    if (modeParam == 'within' || modeParam == 'nearby') return modeParam;
    else return 'nearby';
})

const sortedEntities = computed(() => {
    const entities = relatedEntities.value;
    const withImages = relatedEntities.value.filter(e => e.thumbnailUrl)
    if (withImages.length > 4) return withImages.slice(0,10);
    else return entities.slice(0,10);
})

async function getBaseEntity(): Promise<GeoEntity> {
    const id = router.currentRoute.value.query?.entity as string || undefined;

    // If an ID is provided we can attempt to return it's associated entity
    if (id) {
        const entity = await services.queryService.methods.getById(id);
        if (entity) return entity;
    }

    // Otherwise, assume/fallback to device location as default
    const location = await Geolocation.getCurrentPosition();
    return {
        id: 'corral_user_position',
        name: 'your location',
        position: {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
        }
    }
}

async function findEntities(origin: GeoEntity, mode: ExploreMode, distance: number): Promise<GeoEntity[]> {
    switch (mode) {
        case 'within': return services.queryService.methods.getbyLocation(origin);
        case 'nearby': return (await services.queryService.methods.getByArea(LatLngBounds.fromMapBox(new LngLat(origin.position.lng,origin.position.lat).toBounds(distance)))).features.map(f => f.properties); // (╯‵□′)╯︵┻━┻
    }
}

// Mutations to entity query param should trigger re-calculation of selected entity
watch(router.currentRoute, () => getBaseEntity().then( res => originEntity.value = res), {immediate: true});

// Need to find entities again whenever the base/origin entity mutates
watch(computed(() => { return {originEntity: originEntity.value, mode, distance}}), () => {
    if (originEntity.value) findEntities(originEntity.value, mode.value, distance.value).then(res => relatedEntities.value = res);
})

</script>