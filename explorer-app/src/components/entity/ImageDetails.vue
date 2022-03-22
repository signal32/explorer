<template>

    <!-- Single images do not need a slider -->
<!--
    <div v-if="element.images.length === 1" style="height: 300px; display: inline-block">
        <image-card :src="element.images[0].url"/>
    </div>
-->

    <!-- Display multiple images within a slider -->
    <ion-item v-if="element.images.length > 0">
        <horizontal-list>
            <image-card v-for="item in element.images" :key="item.url" :src="item.url"/>
        </horizontal-list>
    </ion-item>

</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import {ImageDetailElement} from '@/modules/query/detailsService';
import ImageCard from '@/components/entity/ImageCard.vue';
import HorizontalList from '@/components/util/HorizontalList.vue';
import {IonItem} from '@ionic/vue';

export default defineComponent({
    name: "ImageDetails",
    components: {HorizontalList, ImageCard, IonItem},
    props: {
        element: Object as PropType<ImageDetailElement>
    }
})
</script>
