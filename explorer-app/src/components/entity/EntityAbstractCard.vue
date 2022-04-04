<template>
    <ion-card button style="width: 290px;">
        <img v-if="entity.thumbnailUrl" :src="entity.thumbnailUrl" style="height: 200px; width: 290px; object-fit: cover"/>
        <img v-else :src="require('@/assets/image-placeholder.svg')" style="height: 200px; width: 290px; object-fit: cover"/>
        <ion-card-content>
            <ion-card-title>
                {{entity.name}}
            </ion-card-title>
            {{ startCase(entity?.category?.name) }}
            <slot></slot>
        </ion-card-content>
    </ion-card>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import {IonCard, IonCardContent, IonCardTitle} from '@ionic/vue';
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

    components: {IonCard, IonCardContent, IonCardTitle}
})
</script>
