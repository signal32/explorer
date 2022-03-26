<template>
    <IonItemDivider>
        <IonLabel>
            <h2>Similar places</h2>
        </IonLabel>
    </IonItemDivider>
    <IonItem>
        <HorizontalList>
            <EntityAbstractCard v-for="entity in entities" :key="entity.id" :entity="entity" @click="emits('selected', entity)"/>
        </HorizontalList>
    </IonItem>
</template>

<script setup lang="ts">
import {IonItem, IonItemDivider, IonLabel} from '@ionic/vue';
import {Entity} from '@/modules/geo/entity';
import {services} from '@/modules/app/services';
import {defineProps, ref, PropType, defineEmits} from 'vue';
import HorizontalList from '@/components/util/HorizontalList.vue';
import EntityAbstractCard from '@/components/entity/EntityAbstractCard.vue';

const props = defineProps({
    entity: Object as PropType<Entity>,
});

const emits = defineEmits({
    selected: (entity: Entity) => {return entity}
})

const entities = ref<Entity[]>([]);

if (props.entity) {
    services.recommendationService.methods.recommendForEntity(props.entity)
        .then(res => entities.value.push(...res))
}
</script>
