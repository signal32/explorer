<template>
  <ion-page>
      <!-- Map overlay -->
      <div class="explorer-above">
          <div style="display: flex">
              <ion-button shape="round" color="light" @click="router.push('/auth')" style="flex: 1">
                  <ion-icon slot="icon-only" :icon="icons.logo"></ion-icon>
              </ion-button>
              <div style="flex: 1; flex-basis: 500px;" >
                  <div v-show="false" style="background-color: #1f1f1f; border-radius: 9999px; contain: content; box-shadow: 1px 1px 4px 2px rgba(2,2,2,0.45);">
                      <ion-searchbar style="padding: 0"></ion-searchbar>
                  </div>
              </div>
              <ion-button shape="round" color="light" @click="router.push('/settings')">
                  <ion-icon slot="icon-only" :icon="icons.settings"></ion-icon>
              </ion-button>
          </div>
      </div>

      <div v-if="showTutorial" class="explorer-above" style="background-color: rgba(42,42,42,0.71); height: 100%" @click="showTutorial = false">
          <AppTutorial/>
          <div style="padding: 10px">
              <ion-button @click="showTutorial = false" shape="round" expand="full">Close</ion-button>
          </div>
      </div>

        <ion-content :fullscreen="true">
            <!-- Action buttons -->
            <ion-fab v-show="false" vertical="top" horizontal="end" slot="fixed" style="margin-top: 60px">
                <ion-fab-button color="light" @click="move()" style="margin-bottom: 5px">
                    <ion-icon :icon="icons.gps"></ion-icon>
                </ion-fab-button>
                <ion-fab-button color="light" @click="optionsModalOpen = true">
                    <ion-icon :icon="icons.mapConfig"></ion-icon>
                </ion-fab-button>
            </ion-fab>
            <div class="overlay" style="background-color: #3dc2ff;"></div>
            <!-- Main map display port -->
<!--            <MapView v-if="false" v-model:position="position" @update:position="position = $event" @update:selected="openDetailModal($event)"/>-->
            <MapView2
                :key="style"
                :position="position"
                @updatePosition="position = $event"
                :style="style"
                :selected="mapSelected"
                @selected="openDetailModal($event)"
                :buttons="[{name: 'test', icon:icons.mapConfig, action: () => optionsModalOpen = true}, {name: 'tutorial', icon:icons.info, action: () => showTutorial = !showTutorial}]">

                <div slot="fab">
                        <ion-fab-button color="light" @click="move()" style="margin-bottom: 5px">
                            <ion-icon :icon="icons.gps"></ion-icon>
                        </ion-fab-button>
                        <ion-fab-button color="light" @click="optionsModalOpen = true">
                            <ion-icon :icon="icons.mapConfig"></ion-icon>
                        </ion-fab-button>
                </div>

            </MapView2>

            <!-- Selected entity details modal -->
            <ion-modal :is-open="isModalOpenRef" :breakpoints="[0.2, 0.4,1.0]" :initialBreakpoint="detailsModalHeight" @didDismiss="closeDetailModal">
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
                        <div  v-if="selected?.category?.iconUrl" slot="start" style="background-color: white; border-radius: 5px; overflow: clip">
                            <img :src="selected?.category?.iconUrl" :alt="selected?.category?.name" height="30" width="30" style="padding: 2px">
                        </div>

                        <ion-label>{{startCase(selected?.category?.name)}}</ion-label>

                        <ion-buttons slot="end">
                            <ion-button id="trigger-button"><ion-icon :icon="icons.more" size="small" slot="end"></ion-icon></ion-button>
                            <ion-popover trigger="trigger-button" dismissOnSelect="true">
                                <ion-content>
                                    <ion-list>
                                        <ion-item button @click="notInterested(selected?.category)">
                                            <ion-icon :icon="icons.remove" size="small" slot="start"></ion-icon>
                                            Hide&nbsp;<ion-text color="primary"> {{startCase(selected?.category?.name)}}</ion-text>
                                        </ion-item>
                                        <ion-item button>
                                            <ion-icon :icon="icons.save" size="small" slot="start"></ion-icon>
                                            Bookmark Location
                                        </ion-item>
                                    </ion-list>
                                </ion-content>
                            </ion-popover>

                        </ion-buttons>
                    </ion-item>

                    <ion-item button detail v-if="selected?.within" @click="openDetailModal(selected?.within); closeDetailModal()">
                        <ion-label>Located within <ion-text color="primary">{{selected?.within?.name}}</ion-text></ion-label>
                    </ion-item>

                    <ion-item button detail v-if="exploreCategories.includes(selected?.category.name)" @click="router.push({name: 'Explore', query: {entity: selected?.id, mode: 'within'}}); closeDetailModal()">
                        <ion-label>Explore <ion-text color="primary">{{selected?.name}}</ion-text></ion-label>
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
            <ion-modal :is-open="optionsModalOpen" :breakpoints="[0.75, 1.0]" :initialBreakpoint="0.75" @didDismiss="optionsModalOpen = false" >
                <ion-content>
                    <ion-item>
                        <ion-label>Map Configuration</ion-label>
                    </ion-item>
                    <ion-item-divider>
                        <ion-label>
                            <h2>Theme</h2>
                        </ion-label>
                    </ion-item-divider>
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

                    <ion-item-divider>
                        <ion-label>
                            <h2>Categories</h2>
                            <p>Select what is shown on the map.</p>
                        </ion-label>
                    </ion-item-divider>

                    <ion-item v-for="category in categories" :key="category.id" @click="setCategory(category)">
                        <div v-if="category.iconUrl" style="background-color: white; height: 30px; border-radius: 5px" slot="start">
                            <img :src="category.iconUrl" height="30" width="30" style="padding: 2px"/>
                        </div>
                        <ion-label>{{category.name}}</ion-label>
                        <ion-checkbox slot="end" :checked="isLiked(category.id)"></ion-checkbox>
                    </ion-item>
                    <ion-item button detail @click="router.push('/settings/interests'); optionsModalOpen = false">
                        <ion-label>
                            <h3>Advanced filtering</h3>
                            <p>Choose from thousands of categories.</p>
                        </ion-label>
                    </ion-item>
                </ion-content>
            </ion-modal>

        </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref, watch} from 'vue';
import router from '@/router'
import {
    IonAccordion,
    IonAccordionGroup,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonModal,
    IonPage,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
    IonPopover,
    IonList,
    IonText,
    IonCheckbox, IonItemDivider,
} from '@ionic/vue';
import {close, layersOutline, locateOutline, planet, removeCircle, settingsOutline, ellipsisVertical, bookmark, informationOutline} from 'ionicons/icons';
import {startCase} from 'lodash';
import MapView, {MapPosition} from '@/components/MapView.vue';
import {CategoryEntity, Entity, GeoEntity} from '@/modules/geo/entity';
import RecommendBlock from '@/components/blocks/RecommendBlock.vue';
import {services} from '@/modules/app/services';
import EntityDetails from '@/components/entity/EntityDetails.vue';
import {NotificationType} from '@/modules/app/notification';
import MapView2 from '@/components/MapView2.vue';
import AppTutorial from '@/components/AppTutorial.vue';

const defaultAbstract: GeoEntity = {
    id: 'unidentified',
    position: {lat: 0, lng: 0},
    name: 'No selection',
}

const exploreCategories = ['village', 'town', 'city', 'suburb', 'small burgh', 'large burgh', 'big city'];

export default defineComponent({
    components: {
        AppTutorial,
        MapView2,
        EntityDetails, IonList, IonText, IonCheckbox, IonItemDivider,
        RecommendBlock, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFab,
        IonFabButton, IonIcon, IonModal, IonButtons, IonSearchbar, IonItem,
        IonAccordion, IonLabel, IonAccordionGroup, IonSegment, IonSegmentButton, IonPopover,
    },

    setup() {
        // Center position of map, initialised by router params if presented
        let position = ref<MapPosition>({
            lng: router.currentRoute.value.query?.lng as unknown as number|| -2,
            lat: router.currentRoute.value.query?.lat as unknown as number || 57,
            zoom: router.currentRoute.value.query?.zoom as unknown as number || 8,
        });

        // Update router params when internal position value changes
        watch(position, ({zoom, lat, lng}) => {
            router.replace({query: {zoom, lat, lng}})
        })

        watch(computed(() => {return router.currentRoute.value.query}), async (now, prev) => {
            if (router.currentRoute.value.name != 'Map') return;
            position.value = {
                lng: now?.lng as unknown as number,
                lat: now?.lat as unknown as number,
                zoom: now?.zoom as unknown as number,
            };
            if(now.entity && now.entity != prev?.entity){
                const entity = await services.queryService.methods.getById(now.entity as string)
                if (entity) openDetailModal(entity);
            }
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
        const selected = ref<GeoEntity>();

        const mapSelected = ref<GeoEntity[]>([]);

        // Referenced by options modal to open/close dynamically
        const optionsModalOpen = ref(false);

        // Referenced by details modal to open/close dynamically
        const isModalOpenRef = ref(false);
        const detailsModalHeight = ref<0.2 | 0.4>(0.4);

        const showTutorial = ref(false);

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

        const categories = ref<CategoryEntity[]>([
            {name: 'Castles', id: 'wd:Q23413', iconUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Noun%20232996%20cc%20Castle.svg'},
            { name: 'Parks', id: 'wd:Q22698', iconUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Noun%20883674%20cc%20Symbolon%20tree%20icon.svg' },
            { name: 'Museums', id: 'wd:Q33506', iconUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Noun%2026864%20ccCorneliusDanger%20artwork.svg' },
            { name: 'Coffee Houses', id: 'wd:Q30022', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/AB-Autobahnkiosk.svg'},
            { name: 'Public Toilets', id: ' wd:Q813966', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Male_and_female_toilets_symbol-Wuhan_Metro.svg'},
            { name: 'Railway Stations', id: "wd:Q55488", iconUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Q55488%20noun%2019262%20ccPierreLucAuclair%20train-station.svg' },
            {name: 'Architectural Structures', id: 'wd:Q811979', iconUrl: 'http://commons.wikimedia.org/wiki/Special:FilePath/Noun%20232996%20cc%20Castle.svg'},
            { name: 'Nuclear Power Stations', id: 'wd:Q134447', iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Nuclear_power_plant.svg'}
        ]);

        function setCategory(category: CategoryEntity) {
            if (services.preferenceService.liked.some(i => {return (i.entity.id == category.id)})) {
                services.preferenceService.forget(category);
            }
            else {
                services.preferenceService.like(category);
            }
        }

        function isLiked(id: string) {
            return !!services.preferenceService.liked.find(i => {
                return (i.entity.id) == id
            });
        }

        const noCategoriesSelected = computed(() => {return services.preferenceService.liked.length == 0});

        onMounted(() => {
            const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            style.value = (isDarkMode)? 'dark' : 'light';
        })


        return {
            icons: {
                logo: planet,
                settings: settingsOutline,
                gps: locateOutline,
                mapConfig: layersOutline,
                close: close,
                remove: removeCircle,
                more: ellipsisVertical,
                save: bookmark,
                info: informationOutline,
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
            exploreCategories,
            categories,
            setCategory,
            isLiked,
            noCategoriesSelected,
            showTutorial,
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
    position:absolute;
/*    background:#fff4c8;
    border:1px solid #ffcc00;*/
    width:100%;
    padding-right: 6px;
    padding-left: 6px;
    z-index:100;
    top:5px;
}
</style>