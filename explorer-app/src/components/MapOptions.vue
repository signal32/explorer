<template>
    <ion-card>
        <ion-card-content>
            <category-picker title="Filter"></category-picker>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import {IonCard, IonCardContent} from '@ionic/vue';
import CategoryPicker from '@/components/CategoryPicker.vue';

export default {
    name: "MapOptions",

    components: {
        IonCard, IonCardContent, CategoryPicker
    }


}
</script>

<style scoped>

</style>