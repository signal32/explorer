<template>
    <ion-card>
        <img :src="src" :alt="alt"/>
        <ion-card-header>
            <ion-card-title>{{caption}}</ion-card-title>
        </ion-card-header>
    </ion-card>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {IonCard, IonCardHeader, IonCardTitle} from '@ionic/vue';


export default defineComponent({
    name: "ImageCard",

    props: [
        'src',
        'caption',
        'alt',
    ],

    components: {IonCard, IonCardHeader, IonCardTitle}
})
</script>

<style scoped>
img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>