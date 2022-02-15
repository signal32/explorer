<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Map</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">



        <ion-fab vertical="top" horizontal="end" slot="fixed">
            <ion-fab-button color="light" @click="move()">
                <ion-icon :icon="locateOutline"></ion-icon>
            </ion-fab-button>
        </ion-fab>
        <MapView v-model:position="position" @update:position="position = $event" @update:selected="setModalOpen(true, $event)">
        </MapView>

        <ion-modal :is-open="isModalOpenRef" :breakpoints="[0.1,0.5, 0.75,1]" :initialBreakpoint="0.1" :backdropBreakpoint="0.5" @didDismiss="setModalOpen(false)">
            <ion-content>
                <ion-header translucent>
                    <ion-toolbar>
                        <ion-title>{{selectedEntityAbstractRef.name}}</ion-title>
                        <ion-buttons slot="end">
                            <ion-button @click="setModalOpen(false)">Close</ion-button>
                        </ion-buttons>
                    </ion-toolbar>
                </ion-header>

                <h3>Hello</h3>
                <h3>{{selectedEntityAbstractRef.category}}</h3>
            </ion-content>
        </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import {
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonModal,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import {locateOutline} from 'ionicons/icons';
import {defineComponent, ref, watch} from 'vue';
import router from '@/router'
import MapView, {MapPosition} from '@/components/MapView.vue';
import {IEntityAbstract} from '@/modules/query/interfaces';

const defaultAbstract: IEntityAbstract = {
    position: {lat: 0, lng: 0},
    name: 'No selection',
    category: {name: ''}
}

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
        IonIcon,
        IonModal,
        IonButtons,
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

        const isModalOpenRef = ref(false);
        const selectedEntityAbstractRef = ref<IEntityAbstract>();
        function setModalOpen(state: boolean, item?: IEntityAbstract) {
            isModalOpenRef.value = state;
            if (item)
                selectedEntityAbstractRef.value = item;
        }

        return { position, move, locateOutline, isModalOpenRef, setModalOpen, selectedEntityAbstractRef };
    },

});
</script>