<template>
    <ion-title>Related</ion-title>
<!--    <RecycleScroller class="scroller" direction="horizontal" :items="entities" :item-size="300">
        <template #default="{ item }">
            <entity-abstract-card :entity="item"></entity-abstract-card>
        </template>
    </RecycleScroller>-->

    <horizontal-list>
        <entity-abstract-card v-for="entity in entities" :key="entity.id" :entity="entity"></entity-abstract-card>
    </horizontal-list>
</template>

<script lang="ts">
import {defineComponent, PropType, ref} from 'vue';
import {IonTitle} from '@ionic/vue';
import {Entity} from '@/modules/geo/entity';
import {services} from '@/modules/app/services';
import EntityAbstractCard from '@/components/entity/EntityAbstractCard.vue';
import HorizontalList from '@/components/util/HorizontalList.vue';

export default defineComponent({
    name: "RecommendBlock",
    components: {HorizontalList, EntityAbstractCard, IonTitle },

    props: {
        entity: Object as PropType<Entity>
    },

    setup(props) {
        const entities = ref<Entity[]>([]);


        if (props.entity) {
            services.recommendationService.methods.recommendForEntity(props.entity)
                .then(res => entities.value.push(...res))
        }

        return {entities}

    }

});
</script>

<style scoped>
    .scroller {
        height: 150px;
    }
</style>