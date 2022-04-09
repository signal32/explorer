<template>
    <ion-card>
        <div class="image-container">
            <IonProgressBar v-if="isLoading" type="indeterminate" style="min-width: 300px; position: absolute" />
            <ion-img :src="src" :alt="alt" @ionImgWillLoad="isLoading = true" @ionImgDidLoad="isLoading = false"/>
        </div>

        <ion-card-header>
            <ion-card-title>{{caption}}</ion-card-title>
        </ion-card-header>
    </ion-card>
</template>

<script setup lang="ts">
import {computed, defineProps, ref} from 'vue';
import {IonCard, IonCardHeader, IonCardTitle, IonImg, IonProgressBar} from '@ionic/vue';

const props = defineProps<{
    src: string,
    alt?: string,
    caption?: string
}>();

const isLoading = ref(false);
const displayStyle = computed(() => (isLoading.value)? 'none' : 'block');


</script>

<style scoped>
image-container {
    width: 100%;
    height: 100%;
    justify-content: center;
}
.ion-img {
    display: v-bind(displayStyle);
    object-fit: cover;
}
</style>