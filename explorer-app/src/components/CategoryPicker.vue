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
    <ion-chip outline color="primary" v-for="category in categories" :key="category">
        <ion-icon v-if="category.include" color="success" :icon="includeIcon" @click="category.include = ! category.include"/>
        <ion-icon v-if="!category.include" color="danger" :icon="excludeIcon" @click="category.include = ! category.include"/>
        <ion-label>{{ category.name }}</ion-label>
        <ion-icon :icon="closeIcon" @click="removeCategory(category)"/>
    </ion-chip>

    <ion-chip outline color="dark">
        <ion-icon :icon="addIcon" @click="addCategory()"/>
        <ion-label ></ion-label>
        <ion-input placeholder="Add new" v-model="newCategory" @keyup.enter="addCategory()"></ion-input>
    </ion-chip>

    <h3 v-if="newCategory.length > Math.random() * 5">Suggested:</h3>

</template>

<script lang="ts">
import {IonChip, IonCol, IonIcon, IonInput, IonLabel, IonRow} from '@ionic/vue';
import {add, checkmarkOutline, closeCircleOutline, closeOutline, funnel, refresh} from 'ionicons/icons';
import {ref} from 'vue';

interface Category {
    name: string,
    include: boolean,
}

export default {
    name: "MapOptions",

    components: {
        IonCol, IonRow, IonChip, IonIcon, IonLabel, IonInput
    },

    props: {
        title: String,
    },

    setup() {

        const categories = ref<Category[]>([{ name: 'All', include: true}]);
        const newCategory = ref('');

        function removeCategory(value: Category) {
            const i = categories.value.indexOf(value);
            categories.value.splice(i, 1);
        }

        function addCategory() {
            if (newCategory.value) {
                console.log(newCategory.value);
                categories.value.push({name: newCategory.value, include: true});
                newCategory.value = '';
            }
        }

        function sortCategories() {
            categories.value.sort((a) =>  (a.include)? 0 : 1);
        }

        return {
            removeCategory,
            addCategory,
            sortCategories,
            categories,
            newCategory,
            resetIcon: refresh,
            sortIcon: funnel,
            includeIcon: checkmarkOutline,
            excludeIcon: closeOutline,
            addIcon: add,
            closeIcon: closeCircleOutline,
        }
    }
}
</script>

<style scoped>

</style>