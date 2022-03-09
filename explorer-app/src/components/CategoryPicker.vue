<template>
    <ion-row>
        <ion-col size="3">
            <h1>{{ title }}</h1>
        </ion-col>
        <ion-col class="ion-text-right" >
            <ion-button shape="round" color="light" size="small" @click="sortCategories">
                <ion-icon slot="start" :icon="sortIcon"/>
                Sort
            </ion-button>
            <ion-button shape="round" color="light" size="small" @click="categories = []">
                <ion-icon slot="start" :icon="resetIcon"/>
                Reset
            </ion-button>
        </ion-col>
    </ion-row>
    <ion-chip outline color="primary" v-for="category in categories" :key="category.entity.id">
        <ion-icon v-if="category.value >= preferencesStore.likedThreshold" color="success" :icon="includeIcon" @click="preferencesStore.nudge(category.entity, -0.1)"/>
        <ion-icon v-if="category.value < preferencesStore.likedThreshold" color="danger" :icon="excludeIcon" @click="preferencesStore.nudge(category.entity, -0.1)"/>
        <ion-label>{{ startCase(category.entity.name) }}: {{category.value}}</ion-label>
        <ion-icon :icon="closeIcon" @click="removeCategory(category)"/>
    </ion-chip>

    <ion-chip outline color="dark">
        <ion-icon :icon="addIcon" @click="addCategory()"/>
        <ion-label ></ion-label>
        <ion-input placeholder="Add new" v-model="newCategory" @keyup.enter="addCategory()" @keyup="searchCommons"></ion-input>
    </ion-chip>

    <div v-if="suggestedCategories.length > 1">
        <h3>Suggested:</h3>
        <ion-chip outline color="dark" v-for="s in suggestedCategories" :key="s" @click="addCategory(s)" >
            <ion-label>{{ startCase(s.name) }} - {{s.id}}</ion-label>
        </ion-chip>
    </div>


</template>

<script lang="ts">
import {IonChip, IonCol, IonIcon, IonInput, IonLabel, IonRow} from '@ionic/vue';
import {add, checkmarkOutline, closeCircleOutline, closeOutline, funnel, refresh} from 'ionicons/icons';
import {computed, ref} from 'vue';
import {AppServices, services} from '@/modules/app/services';
import {EntityRating} from '@/modules/auth/entityPreferencesStore';
import {startCase} from 'lodash';
import {CategoryEntity} from '@/modules/geo/entity';

export default {
    name: "MapOptions",

    components: {
        IonCol, IonRow, IonChip, IonIcon, IonLabel, IonInput
    },

    props: {
        title: String,
    },

    setup() {

        const preferencesStore = AppServices.userPreferencesStore;
        const categories = computed( () => preferencesStore.liked);

        const newCategory = ref('');
        const suggestedCategories = ref<CategoryEntity[]>([]);


        function removeCategory(value: EntityRating) {
            preferencesStore.forget(value.entity);
        }

        function addCategory(category: CategoryEntity = { name: newCategory.value, id: 'unknown' + newCategory.value}) {
            if (category) {
                // todo: use the queryplugin or new category plugin to check categories are correct and instantiate valid 'Entity'
                preferencesStore.like({...category}); //creating a copy here
                newCategory.value = '';
            }
        }

        function sortCategories() {
            categories.value.sort((a, b) =>  a.value - b.value);
        }

        function searchCommons() {
            services.categoryService.methods.searchCategoryLabels(newCategory.value)
            .then((res) => {
                suggestedCategories.value = res;
            })
        }

        return {
            removeCategory,
            addCategory,
            sortCategories,
            searchCommons,
            categories,
            newCategory,
            suggestedCategories,
            resetIcon: refresh,
            sortIcon: funnel,
            includeIcon: checkmarkOutline,
            excludeIcon: closeOutline,
            addIcon: add,
            closeIcon: closeCircleOutline,
            preferencesStore,
            startCase,
        }
    }
}
</script>

<style scoped>

</style>