<template>
  <ion-page>
      <div class="explorer-above">

          <ion-row>
              <ion-col size="2">
                  <ion-button shape="round" color="light" @click="router.push('/auth')">
                      <ion-icon slot="icon-only" :icon="planet"></ion-icon>
                  </ion-button>
              </ion-col>
              <ion-col size="8">
                  <div style="background-color: transparent; border-radius: 15pc; contain: content; box-shadow: 1px 1px 4px 2px rgba(2,2,2,0.45);">
                      <ion-searchbar style="padding: 0"></ion-searchbar>
                  </div>
              </ion-col>
              <ion-col size="2">
                  <ion-button shape="round" color="light" @click="router.push('/debug')">
                      <ion-icon slot="icon-only" :icon="settingsOutline"></ion-icon>
                  </ion-button>
              </ion-col>
          </ion-row>
      </div>
    <ion-content :fullscreen="true">

        <ion-fab vertical="top" horizontal="end" slot="fixed" style="margin-top: 60px">
            <ion-fab-button color="light" @click="move()" >
                <ion-icon :icon="locateOutline"></ion-icon>
            </ion-fab-button>
            <ion-fab-button color="light" @click="optionsModalOpen = true">
                <ion-icon :icon="layersOutline"></ion-icon>
            </ion-fab-button>
        </ion-fab>
        <MapView v-model:position="position" @update:position="position = $event" @update:selected="setModalOpen(true, $event)">
        </MapView>

        <ion-modal :is-open="isModalOpenRef" :breakpoints="[0.1,0.5, 0.75,1]" :initialBreakpoint="0.5" :backdropBreakpoint="0.1" @didDismiss="setModalOpen(false)">
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

        <ion-modal :is-open="optionsModalOpen" :breakpoints="[0.5,0.8]" :initialBreakpoint="0.5" @didDismiss="optionsModalOpen = false" >
            <ion-content>
                <map-options></map-options>
            </ion-content>
        </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import 'maplibre-gl/dist/maplibre-gl.css'
import {
    IonButtons, IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonModal,
    IonPage, IonRow,
    IonSearchbar,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import {locateOutline, planet, settingsOutline, layersOutline} from 'ionicons/icons';
import {defineComponent, ref, watch} from 'vue';
import router from '@/router'
import MapView, {MapPosition} from '@/components/MapView.vue';
import {GeoEntity} from '@/modules/geo/entity';
import MapOptions from '@/components/MapOptions.vue';
import {useRouter} from 'vue-router';

const defaultAbstract: GeoEntity = {
    id: 'unidentified',
    position: {lat: 0, lng: 0},
    name: 'No selection',
}

export default defineComponent({
    components: { MapOptions, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFab,
        IonFabButton, IonIcon, IonModal, IonButtons, MapView, IonSearchbar, IonCol, IonRow,
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
        const selectedEntityAbstractRef = ref<GeoEntity>();
        function setModalOpen(state: boolean, item?: GeoEntity) {
            isModalOpenRef.value = state;
            if (item)
                selectedEntityAbstractRef.value = item;
        }

        const optionsModalOpen = ref(true);

        return { position, move, locateOutline, planet, settingsOutline, layersOutline, isModalOpenRef, optionsModalOpen, setModalOpen, selectedEntityAbstractRef, router };
    },

});
</script>

<style>
div.explorer-above {
    position:fixed;
/*    background:#fff4c8;
    border:1px solid #ffcc00;*/
    width:100%;
    z-index:100;
    top:5px;
}
</style>