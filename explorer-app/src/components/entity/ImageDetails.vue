<template>

    <!-- Single images do not need a slider -->
    <div v-if="element.images.length === 1">
        <image-card :src="element.images[0].url"/>
    </div>

    <!-- Display multiple images within a slider -->
    <div class="horizontal-container" v-else-if="element.images.length >= 1">
        <image-card class="horizontal-item" v-for="item in element.images" :key="item.url" :src="item.url"/>
    </div>

</template>

<script lang="ts">
import 'vue3-carousel/dist/carousel.css';
import {defineComponent, PropType, ref} from 'vue';
import {ImageDetailElement} from '@/modules/query/detailsService';
import ImageCard from '@/components/entity/ImageCard.vue';

export default defineComponent({
    name: "ImageDetails",
    components: {ImageCard},
    props: {
        element: Object as PropType<ImageDetailElement>
    }
})
</script>

<style>
.horizontal-container {
    overflow: auto;
    white-space: nowrap;
}

.horizontal-item {
    display: inline-block;
    height: 300px;
}
</style>