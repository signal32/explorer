<template>
    <ion-card style="width: 290px">
        <img :src="require('@/assets/image-placeholder.svg')"/>
        <ion-card-header>
            <ion-card-title>{{entity.name}}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
            {{ entity.category }}
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import {IonCard, IonCardContent, IonCardHeader, IonCardTitle} from '@ionic/vue';
import {Entity} from '@/modules/geo/entity';

export default defineComponent({
    name: "EntityAbstractCard",

    props: {
        entity: Object as PropType<Entity>
    },

    components: {IonCard, IonCardContent, IonCardHeader, IonCardTitle}
})
</script>

<style scoped>

</style>