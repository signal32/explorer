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
<!--            <MapView v-if="false" v-model:position="position" @update:position="position = $event" @update:selected="openDetailModal($event)"/>-->
            <MapView2 :key="style" :position="position" @updatePosition="position = $event" :style="style" :selected="mapSelected" @selected="openDetailModal($event)"></MapView2>

            <!-- Selected entity details modal -->
            <ion-modal :is-open="isModalOpenRef" :breakpoints="[0.2, 0.4,1.0]" :initialBreakpoint="detailsModalHeight" :backdropBreakpoint="0.1" @didDismiss="closeDetailModal">
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
                            <ion-button @click="notInterested(selected?.category)">
                                Not interested
                                <ion-icon :icon="icons.remove" size="small" slot="end"></ion-icon>
                            </ion-button>
                        </ion-buttons>
                    </ion-item>

                    <!-- Details Section -->
                    <entity-details :entity="selected"/>

                    <!-- Recommendation Section -->
                    <recommend-block :entity="selected" @selected="moveToSelected($event); closeDetailModal()"/>

                    <!-- Debug information -->
                    <ion-accordion-group>
                        <ion-accordion value="colors">
                            <ion-item slot="header">
                                <ion-label>Developer details</ion-label>
                            </ion-item>
                            <ion-item slot="content">
                                <pre>{{JSON.stringify(selected, null, 2)}}</pre>
                            </ion-item>
                        </ion-accordion>
                    </ion-accordion-group>
                </ion-content>
            </ion-modal>

            <!-- Map view configuration modal -->
            <ion-modal :is-open="optionsModalOpen" :breakpoints="[0.3]" :initialBreakpoint="0.3" @didDismiss="optionsModalOpen = false" >
                <ion-content>
                    <ion-item>
                        <ion-label>Map Configuration</ion-label>
                    </ion-item>
                    <ion-item lines="none">
                        <ion-label>
                            <h3>Theme</h3>
                        </ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-segment value="default">
                            <ion-segment-button value="default">
                                <ion-label>Default</ion-label>
                            </ion-segment-button>
                            <ion-segment-button value="dark" @click="style='light'" >
                                <ion-label>Light</ion-label>
                            </ion-segment-button>
                            <ion-segment-button value="light" @click="style='dark'">
                                <ion-label>Dark</ion-label>
                            </ion-segment-button>
                        </ion-segment>
                    </ion-item>
                    <ion-item button detail @click="router.push('/settings/interests'); optionsModalOpen = false">
                        <ion-label>
                            <h3>Your interests</h3>
                            <p>Control what is shown on the map.</p>
                        </ion-label>
                    </ion-item>
                </ion-content>
            </ion-modal>

        </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {defineComponent, ref, watch} from 'vue';
import router from '@/router'
import {
    IonAccordion,
    IonAccordionGroup,
    IonButtons,
    IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonModal,
    IonPage,
    IonRow,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import {close, layersOutline, locateOutline, planet, removeCircleOutline, settingsOutline} from 'ionicons/icons';
import {startCase} from 'lodash';
import MapView, {MapPosition} from '@/components/MapView.vue';
import {Entity, GeoEntity} from '@/modules/geo/entity';
import RecommendBlock from '@/components/blocks/RecommendBlock.vue';
import {services} from '@/modules/app/services';
import EntityDetails from '@/components/entity/EntityDetails.vue';
import {NotificationType} from '@/modules/app/notification';
import MapView2 from '@/components/MapView2.vue';

const defaultAbstract: GeoEntity = {
    id: 'unidentified',
    position: {lat: 0, lng: 0},
    name: 'No selection',
}

export default defineComponent({
    components: {
        MapView2,
        EntityDetails,
        RecommendBlock, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFab,
        IonFabButton, IonIcon, IonModal, IonButtons, IonSearchbar, IonCol, IonRow, IonItem,
        IonAccordion, IonLabel, IonAccordionGroup, IonSegment, IonSegmentButton
    },

    setup() {
        // Center position of map, initialised by router params if presented
        let position = ref<MapPosition>({
            lng: router.currentRoute.value.query?.lng as unknown as number|| 1,
            lat: router.currentRoute.value.query?.lat as unknown as number || 1,
            zoom: router.currentRoute.value.query?.zoom as unknown as number || 1,
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

        const mapSelected = ref<GeoEntity[]>([]);

        // Referenced by options modal to open/close dynamically
        const optionsModalOpen = ref(false);

        // Referenced by details modal to open/close dynamically
        const isModalOpenRef = ref(false);
        const detailsModalHeight = ref<0.2 | 0.4>(0.4);

        /// Open detail modal with given entity
        function openDetailModal(item: GeoEntity) {
            mapSelected.value = [item];
            services.queryService.methods.getById(item?.id)
                .then(res => {
                    selected.value = res;
                    isModalOpenRef.value = true;
                })
                .catch(err => {
                    console.log(err);
                    //services.queryService.methods.
                })
        }

        /// Close the detail modal
        function closeDetailModal() {
            mapSelected.value = [];
            isModalOpenRef.value = false;
        }

        function notInterested(entity: Entity) {
            services.preferenceService.dislike(entity);
            services.notificationService.pushNotification({
                title: 'Category Removed',
                description: `We've removed ${entity.name} from your preferences.`,
                type: NotificationType.TOAST,
            })
        }

        async function moveToSelected(entity: Entity){
            const geoEntity = await services.queryService.methods.getById(entity.id);
            if (geoEntity) {
                position.value = {
                    lat: geoEntity.position.lat,
                    lng: geoEntity.position.lng,
                    zoom: 16,
                }
                detailsModalHeight.value = 0.2;
                setTimeout(() => openDetailModal(geoEntity), 500 );
                setTimeout(() => detailsModalHeight.value = 0.4, 1500 );
            }
        }

        const style = ref<'light' |'dark'>('dark');


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
            detailsModalHeight,
            optionsModalOpen,
            move,
            openDetailModal,
            closeDetailModal,
            moveToSelected,
            notInterested,
            startCase,
            router,
            services,
            style,
            mapSelected,
        }
    },


    methods: {
        log(obj: any) {
            console.log(obj.id);
        }
    }

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