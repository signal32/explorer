<template>
  <ion-page>
      <!-- Map overlay -->
      <div class="explorer-above">
          <ion-row>
              <ion-col size="2">
                  <ion-button shape="round" color="light" @click="router.push('/auth')">
                      <ion-icon slot="icon-only" :icon="icons.logo"></ion-icon>
                  </ion-button>
              </ion-col>
              <ion-col size="8">
                  <div style="background-color: transparent; border-radius: 15pc; contain: content; box-shadow: 1px 1px 4px 2px rgba(2,2,2,0.45);">
                      <ion-searchbar style="padding: 0"></ion-searchbar>
                  </div>
              </ion-col>
              <ion-col size="2">
                  <ion-button shape="round" color="light" @click="router.push('/settings')">
                      <ion-icon slot="icon-only" :icon="icons.settings"></ion-icon>
                  </ion-button>
              </ion-col>
          </ion-row>
      </div>

        <ion-content :fullscreen="true">
            <!-- Action buttons -->
            <ion-fab vertical="top" horizontal="end" slot="fixed" style="margin-top: 60px">
                <ion-fab-button color="light" @click="move()" >
                    <ion-icon :icon="icons.gps"></ion-icon>
                </ion-fab-button>
                <ion-fab-button color="light" @click="optionsModalOpen = true">
                    <ion-icon :icon="icons.mapConfig"></ion-icon>
                </ion-fab-button>
            </ion-fab>

            <!-- Main map display port -->
            <MapView v-model:position="position" @update:position="position = $event" @update:selected="openDetailModal($event)"/>

            <!-- Selected entity details modal -->
            <ion-modal :is-open="isModalOpenRef" :breakpoints="[0.1,0.5, 0.75,0.9]" :initialBreakpoint="0.5" :backdropBreakpoint="0.1" @didDismiss="closeDetailModal">
                <ion-content>
                    <ion-header translucent>
                        <ion-toolbar>
                            <ion-title>{{selected?.name}}</ion-title>
                            <ion-buttons slot="end">
                                <ion-button @click="closeDetailModal">
                                    <ion-icon :icon="icons.close"></ion-icon>
                                </ion-button>
                            </ion-buttons>
                        </ion-toolbar>
                    </ion-header>

                    <ion-item>
                        <div  v-if="selected?.category?.iconUrl" slot="start" style="background-color: white; border-radius: 9999px; overflow: clip">
                            <img :src="selected?.category?.iconUrl" :alt="selected?.category?.name" height="30" >
                        </div>

                        <ion-label>{{startCase(selected?.category?.name)}}</ion-label>

                        <ion-buttons slot="end">
                            <ion-button @click="closeDetailModal">
                                Not interested
                                <ion-icon :icon="icons.remove" size="small" slot="end"></ion-icon>
                            </ion-button>
                        </ion-buttons>
                    </ion-item>

                    <entity-details :entity="selected"/>
                    <recommend-block :entity="selected"/>
                    <ion-accordion-group>
                    <ion-accordion value="colors">
                        <ion-item slot="header">
                            <ion-label>Details</ion-label>
                        </ion-item>

                        <ion-item slot="content">
                            <pre>{{JSON.stringify(selected, null, 2)}}</pre>
                        </ion-item>
                    </ion-accordion>
                    </ion-accordion-group>
                </ion-content>
            </ion-modal>

            <!-- Map view configuration modal -->
            <ion-modal :is-open="optionsModalOpen" :breakpoints="[0.5,0.8]" :initialBreakpoint="0.5" @didDismiss="optionsModalOpen = false" >
                <ion-content>
                    <map-options></map-options>
                </ion-content>
            </ion-modal>

        </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {defineComponent, ref, watch} from 'vue';
import router from '@/router'
import {
    IonButtons, IonCol, IonContent, IonFab, IonFabButton,
    IonHeader, IonIcon, IonModal, IonPage, IonRow,
    IonSearchbar, IonTitle, IonToolbar, IonItem, IonLabel, IonAccordion, IonAccordionGroup
} from '@ionic/vue';
import {locateOutline, planet, settingsOutline, layersOutline, removeCircleOutline, close} from 'ionicons/icons';
import {startCase} from 'lodash';
import MapView, {MapPosition} from '@/components/MapView.vue';
import {Entity, GeoEntity} from '@/modules/geo/entity';
import MapOptions from '@/components/MapOptions.vue';
import RecommendBlock from '@/components/blocks/RecommendBlock.vue';
import {services} from '@/modules/app/services';
import EntityDetails from '@/components/entity/EntityDetails.vue';

const defaultAbstract: GeoEntity = {
    id: 'unidentified',
    position: {lat: 0, lng: 0},
    name: 'No selection',
}

export default defineComponent({
    components: {
        EntityDetails,
        RecommendBlock, MapOptions, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFab,
        IonFabButton, IonIcon, IonModal, IonButtons, MapView, IonSearchbar, IonCol, IonRow, IonItem,
        IonAccordion, IonLabel, IonAccordionGroup
    },

    setup() {
        // Center position of map, initialised by router params if presented
        let position = ref<MapPosition>({
            lng: router.currentRoute.value.query?.lng as unknown as number,
            lat: router.currentRoute.value.query?.lat as unknown as number,
            zoom: router.currentRoute.value.query?.zoom as unknown as number,
        });

        // Update router params when internal position value changes
        watch(position, ({zoom, lat, lng}) => {
            router.replace({query: {zoom, lat, lng}})
        })

        // Move map to position
        function move() {
            position.value = {
                lng: -2.371366618261618,
                lat: 57.28271220381899,
                zoom: 13.3,
            }
        }
        // Reference to currently selected 'active' entity
        const selected = ref<Entity>();

        // Referenced by options modal to open/close dynamically
        const optionsModalOpen = ref(false);

        // Referenced by details modal to open/close dynamically
        const isModalOpenRef = ref(false);

        /// Open detail modal with given entity
        function openDetailModal(item: GeoEntity) {
            services.queryService.methods.getById(item?.id)
                .then(res => {
                    selected.value = res;
                    isModalOpenRef.value = true;
                });
        }

        /// Close the detail modal
        function closeDetailModal() {
            isModalOpenRef.value = false;
        }


        return {
            icons: {
                logo: planet,
                settings: settingsOutline,
                gps: locateOutline,
                mapConfig: layersOutline,
                close: close,
                remove: removeCircleOutline,
            },
            position,
            selected,
            isModalOpenRef,
            optionsModalOpen,
            move,
            openDetailModal,
            closeDetailModal,
            startCase,
            router,
            services,
        }
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