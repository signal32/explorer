<template>
    <div>
        <h1>Entity</h1>
        <entity-details :entity="entity" />
    </div>
</template>

<script lang="ts">
import {computed, defineComponent} from 'vue';
import EntityDetails from '@/components/entity/EntityDetails.vue';
import router from '@/router';
import {Entity} from '@/modules/geo/entity';

export default defineComponent({
    name: "EntityPage",
    components: {EntityDetails},
    setup() {
        const entity = computed<Entity>(() => {
            const id = router.currentRoute.value.query?.entity as unknown as string;
            return {
                id,
                name: 'test'
            };
        });

        return {entity: entity};
    }
})
</script>
