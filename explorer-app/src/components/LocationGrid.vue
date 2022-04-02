<template>
    <div class="masonry">
        <div class="item" v-for="entity in entities" :key="entity.id">
            <EntityAbstractCard :entity="entity" style="width: 100%" @click="goToEntity(entity)"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import {defineProps, ref} from 'vue';
import {Entity, GeoEntity} from '@/modules/geo/entity';
import {services} from '@/modules/app/services';
import EntityAbstractCard from '@/components/entity/EntityAbstractCard.vue';
import router from '@/router';

    const props = defineProps<{
        entities: GeoEntity[],
    }>();

    function goToEntity(entity: GeoEntity) {
        router.push({name: 'Map', query: {lng: entity.position.lng, lat: entity.position.lat, zoom: 15, entity: entity.id}});
    }

</script>

<style scoped>
.masonry { /* Masonry container */
    column-count: 2;
    column-gap: 1em;
}

.item { /* Masonry bricks or child elements */
    display: inline-block;
    width: 100%;
}
</style>