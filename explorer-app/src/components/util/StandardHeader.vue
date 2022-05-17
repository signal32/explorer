<template>
    <ion-header :translucent="true">
        <ion-toolbar>
            <ion-title>{{ title }}</ion-title>
            <ion-buttons slot="start">
                <ion-back-button></ion-back-button>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import {IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton} from '@ionic/vue';

export default defineComponent({
    name: "StandardHeader",
    components: {IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton},
    props: {
        title: String as PropType<string>
    }
})
</script>
