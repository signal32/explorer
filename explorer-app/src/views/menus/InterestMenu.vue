<template>
    <ion-page>
        <standard-header :title="'Interests'"></standard-header>
        <ion-content :fullscreen="true">
            <ion-item color="tertiary">
                <ion-icon slot="start" :icon="icons.heart"></ion-icon>
                <ion-label class="ion-text-wrap">
                    <h1>Personalise your map</h1>
                    <p>Tell us what you like and we'll build a map that's right for you.</p>
                </ion-label>
            </ion-item>

            <ion-item lines="none">
                <ion-label position="stacked">Search</ion-label>
                <ion-input placeholder="Search here for museums, monuments, parks and more" @ionChange="searchTermChanged"></ion-input>
            </ion-item>

            <ion-item v-if="suggestedCategories.length > 0" lines="none">
                <ion-label>
                    <p>Suggested:</p>
                    <horizontal-list>
                        <ion-chip outline color="dark" v-for="s in suggestedCategories" :key="s" @click="addCategory(s)" @click.ctrl="logCategory(s)">
                            <ion-label>{{ startCase(s.name) }}</ion-label>
                        </ion-chip>
                    </horizontal-list>
                </ion-label>
            </ion-item>

            <ion-item lines="none">
                <ion-segment @ionChange="segmentChanged($event)" >
                    <ion-segment-button value="liked">
                        <ion-label>Liked</ion-label>
                    </ion-segment-button>
                    <ion-segment-button value="disliked">
                        <ion-label>Disliked</ion-label>
                    </ion-segment-button>
                </ion-segment>
            </ion-item>

            <ion-list v-if="categories2.length > 0">
                <ion-item v-for="c in categories2" :key="c">
                    <ion-label>{{startCase(c.entity.name)}}</ion-label>
                    <ion-button slot="end" color="light" @click="removeCategory(c.entity)">
                        <ion-icon slot="icon-only" :icon="icons.remove"/>
                    </ion-button>
<!--                    <ion-button slot="end" color="light" size="small" @click="removeCategory(c.entity)">
                        <ion-icon v-if="c.value > 0.5" slot="icon-only" :icon="icons.dislike"/>
                        <ion-icon v-else slot="icon-only" :icon="icons.like"/>
                    </ion-button>-->
                </ion-item>
            </ion-list>

            <div v-if="categories2.length == 0" class="ion-text-center" style="padding-top: 50px">
                <ion-label>
                    <h2>╰（‵□′）╯</h2>
                    <p>Nothing to show. Try adding some categories.</p>
                    <br>
                    <p><b>Liked</b> categories will be shown on the map.</p>
                    <p><b>Disliked</b> categories will be hidden.</p>
                </ion-label>
            </div>

        </ion-content>

    </ion-page>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import {
    IonPage, IonContent,IonSearchbar, IonInput,IonButton, IonChip,
    IonList, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonSegment, IonSegmentButton
} from '@ionic/vue';
import router from '@/router';
import StandardHeader from '@/components/headers/StandardHeader.vue';
import {services} from '@/modules/app/services';
import {CategoryEntity, Entity} from '@/modules/geo/entity';
import {startCase} from 'lodash';
import HorizontalList from '@/components/util/HorizontalList.vue';
import {trash, arrowUp, thumbsDownSharp, thumbsUpSharp, heartOutline} from 'ionicons/icons'


export default defineComponent({
    name: "InterestMenu",
    components: {
        HorizontalList, StandardHeader,
        IonPage, IonContent, IonSegment, IonSegmentButton, IonLabel, IonInput, IonButton, IonChip, IonItem, IonList, IonIcon
    },
    setup() {
        const viewMode = ref<'liked' | 'disliked'>('liked');
        const categories = ref(services.preferenceService.ratingMap);
        const suggestedCategories = ref<CategoryEntity[]>([])

        const categories2 = computed({
            get: () => {
                if (viewMode.value == 'liked') return services.preferenceService.liked;
                else if (viewMode.value == 'disliked') return services.preferenceService.disliked;
                else return [];
            },
            set: (v) => console.log(v),
        })

        function segmentChanged(ev: CustomEvent) {
            if (ev.detail.value == 'liked') viewMode.value = 'liked';
            else if (ev.detail.value == 'disliked') viewMode.value = 'disliked';
        }

        async function searchTermChanged(ev: CustomEvent) {
            suggestedCategories.value  = await services.categoryService.methods.searchCategoryLabels(ev.detail.value);
        }

        function addCategory(category: CategoryEntity) {
            if (viewMode.value == 'liked') services.preferenceService.like({...category});
            else if (viewMode.value == 'disliked') services.preferenceService.dislike({...category});
        }

        function removeCategory(category: Entity) {
            services.preferenceService.forget(category);
        }

        function logCategory(category: CategoryEntity) {
            console.log(`Selected category name: ${category.name}, id: ${category.id}`, category);
        }


        return {router, viewMode, categories2, suggestedCategories, segmentChanged, addCategory, removeCategory, searchTermChanged, startCase, logCategory, icons: {
            remove: trash,
                up: arrowUp,
                like: thumbsUpSharp,
                dislike: thumbsDownSharp,
                heart: heartOutline,
            }}
    },

});
</script>
