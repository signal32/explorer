<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Home</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
        <ion-fab vertical="top" horizontal="end" slot="fixed">
            <ion-fab-button color="light" @click="move()">
                <ion-icon :icon="locateOutline"></ion-icon>
            </ion-fab-button>
        </ion-fab>
        <MapView v-model:position="position" @update:position="position = $event">
        </MapView>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
// Inspired by https://documentation.maptiler.com/hc/en-us/articles/4413873409809-Display-a-map-in-Vue-js-using-MapLibre-GL-JS
import 'maplibre-gl/dist/maplibre-gl.css'
import {IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar} from '@ionic/vue';
import {locateOutline} from 'ionicons/icons';
import {defineComponent, ref, watch} from 'vue';
import router from '@/router'
import MapView from '@/components/MapView.vue';
import {MapPosition} from '@/components/MapView.vue';

export default defineComponent({
    components: {
        IonContent,
        IonHeader,
        IonPage,
        IonTitle,
        IonToolbar,
        MapView,
        IonFab,
        IonFabButton,
        IonIcon
    },

    setup() {
        let position = ref<MapPosition>({
            lng: router.currentRoute.value.query?.lng as unknown as number,
            lat: router.currentRoute.value.query?.lat as unknown as number,
            zoom: router.currentRoute.value.query?.zoom as unknown as number,
        });

        watch(position, ({zoom, lat, lng}) => {
            router.replace({query: {zoom, lat, lng}})
        })

        function move() {
            position.value = {
                lng: -2.371366618261618,
                lat: 57.28271220381899,
                zoom: 13.3,
            }
        }

        return { position, move, locateOutline };
    },

});
</script>