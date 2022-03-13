<template>
    <h1>{{entity.name}}</h1>
    <h6>{{entity.id}}</h6>

    <image-details v-if="headerImages" :element="headerImages"/>

    <div v-if="details.length > 0">
        <div v-for="detail in details" :key="detail.id">

            <div v-if="detail.type === 'images'">
                <image-details :element="detail"/>
            </div>

            <div v-if="detail.type === 'actions'">
                <action-details :element="detail"/>
            </div>

            <entity-details v-if="detail.type === 'section'"></entity-details>

        </div>
    </div>

</template>

<script lang="ts">
import {defineComponent, PropType, ref} from 'vue';
import {services} from '@/modules/app/services';
import {Entity} from '@/modules/geo/entity';
import {DetailElement, ImageDetailElement} from '@/modules/query/detailsService';
import ImageDetails from '@/components/entity/ImageDetails.vue';
import ActionDetails from '@/components/entity/ActionDetails.vue';


export default defineComponent({
    name: "EntityDetails",
    components: {ActionDetails, ImageDetails},
    props: {
        entity: Object as PropType<Entity>,
    },

    setup(props) {
        // Collection of for details
        const details = ref<DetailElement[]>([]);
        // Subset of images to display at top of component
        const headerImages = ref<ImageDetailElement>();

        // Get details and divide extract into required parts
        if (props.entity){
            services.detailService.getDetails(props.entity)
                .then(result => {
                    result.forEach(i => {
                        if (i.type == 'images') headerImages.value = i;
                        else details.value.push(i);
                    })
                });
        }

        return {headerImages, details};
    },

})
</script>
