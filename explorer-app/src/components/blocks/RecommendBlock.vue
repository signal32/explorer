<template>
    <IonItemDivider v-if="recommendations.length > 0">
        <IonLabel>
            <h2>Similar places</h2>
        </IonLabel>
    </IonItemDivider>
    <IonItem>
        <HorizontalList>
            <EntityAbstractCard v-for="rec in recommendations" :key="rec.entity.id" :entity="rec.entity" @click="emits('selected', rec.entity)">
                <RecommendationDetails :recommendation="rec"/>
            </EntityAbstractCard>
        </HorizontalList>
    </IonItem>
</template>

<script setup lang="ts">
import {IonItem, IonItemDivider, IonLabel} from '@ionic/vue';
import {Entity} from '@/modules/geo/entity';
import {services} from '@/modules/app/services';
import {defineProps, ref, defineEmits} from 'vue';
import HorizontalList from '@/components/util/HorizontalList.vue';
import EntityAbstractCard from '@/components/entity/EntityAbstractCard.vue';
import {Recommendation} from '@/modules/app/recommendationService';
import RecommendationDetails from '@/components/RecommendationDetails';

const props = defineProps<{entity: Entity}>();

const emits = defineEmits({
    selected: (entity: Entity) => {return entity}
})

const recommendations = ref<Recommendation[]>([]);

if (props.entity) {
    services.recommendationService.methods.recommendForEntity(props.entity)
        .then(res => {
            res.sort((a, b) => {
                if (a.relevance == 'high') return 0;
                else if (a.relevance == 'medium' && b.relevance == 'high') return 1;
                else if (a.relevance == 'low') return  1;
                else if (a.distance && b.distance) return (a.distance < b.distance)? 0: 1
                return (a.entity.thumbnailUrl)? 0 : 1
            })
            const categoryCount = new Map<string, number>();
            recommendations.value = res.filter(i => {
                const count = categoryCount.get(i.entity.id) || 0;
                const countRec = ((i.reason )? categoryCount.get(i.reason) : 0) || 0;
                if (count > 3) return false;
                else categoryCount.set(i.entity.id, count + 1);
                if (countRec > 3) return false;
                else categoryCount.set(i.reason as string, count + 1);
                return true;
            })
        })
}
</script>
