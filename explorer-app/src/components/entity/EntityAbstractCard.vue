<template>
    <ion-card style="width: 290px">
<!--        <img v-if="entity.category.iconUrl" :src="entity.category.iconUrl"/>-->
        <img :src="require('@/assets/image-placeholder.svg')"/>
        <ion-card-header>
            <ion-card-title>{{entity.name}}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
            {{ startCase(entity?.category?.name) }}
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import {IonCard, IonCardContent, IonCardHeader, IonCardTitle} from '@ionic/vue';
import {Entity} from '@/modules/geo/entity';
import {startCase} from 'lodash';

export default defineComponent({
    name: "EntityAbstractCard",

    props: {
        entity: Object as PropType<Entity>
    },

    methods: {
        startCase,
    },

    components: {IonCard, IonCardContent, IonCardHeader, IonCardTitle}
})
</script>

<style scoped>

</style>