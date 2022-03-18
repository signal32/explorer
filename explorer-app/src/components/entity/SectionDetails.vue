<template>

    <div v-if="section">
    <div v-for="element in section.elements" :key="element.id">
<!--        <text-details v-if="element.type === 'text'" :element="element"/>-->
        <image-details v-else-if="element.type === 'images'" :element="element"/>
        <action-details v-else-if="element.type === 'actions'" :element="element"/>
<!--        <properties-details v-else-if="element.type === 'properties'" :element="element"/>-->
        <section-details v-else-if="element.type == 'section'" :element="element" />
    </div>
    </div>

</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import {SectionDetailElement} from '@/modules/query/detailsService';
import ImageDetails from '@/components/entity/ImageDetails.vue';
import ActionDetails from '@/components/entity/ActionDetails.vue';

export default defineComponent({
    name: "SectionDetails",
    components: {ActionDetails, ImageDetails},
    props: {
        section: Object as PropType<SectionDetailElement>
    }
})
</script>
