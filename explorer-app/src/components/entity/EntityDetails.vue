<template>
    <image-details v-if="headerImages" :element="headerImages"/>

    <div v-if="details.length > 0">
        <div v-for="detail in details" :key="detail.id">

            <div v-if="detail.type === 'images'">
                <image-details :element="detail"/>
            </div>

            <div v-if="detail.type === 'actions'">
                <action-details :element="detail"/>
            </div>

            <div v-if="detail.type === 'text'">
                <text-details :element="detail"/>
            </div>

            <div v-if="detail.type === 'section'">
                <ion-item-divider v-if="detail.title">
                    <ion-label>
                        <h2>{{detail.title}}</h2>
                        <p>{{detail.subtitle}}</p>
                    </ion-label>
                </ion-item-divider>
                <entity-details :element="detail.elements"/>
            </div>

<!--            <div v-else>{{detail}}</div>-->
        </div>
    </div>

</template>

<script lang="ts">
import {defineComponent, PropType, ref} from 'vue';
import {services} from '@/modules/app/services';
import {Entity} from '@/modules/geo/entity';
import {DetailElement, ImageDetailElement, SectionDetailElement} from '@/modules/query/detailsService';
import ImageDetails from '@/components/entity/ImageDetails.vue';
import ActionDetails from '@/components/entity/ActionDetails.vue';
import TextDetails from '@/components/entity/TextDetails.vue';
import {IonLabel, IonItemDivider} from '@ionic/vue';


export default defineComponent({
    name: "EntityDetails",
    components: {TextDetails, ActionDetails, ImageDetails, IonLabel, IonItemDivider},
    props: {
        entity: Object as PropType<Entity>,
        element: Object as PropType<DetailElement[]>
    },

    setup(props) {
        // Collection of for details
        const details = ref<DetailElement[]>([]);
        // Subset of images to display at top of component
        const headerImages = ref<ImageDetailElement>();

        // If supplied, use directly supplied element
        if (props.element) {
            details.value.push(...props.element)
        }
        // Otherwise, use the provided entity to get the required details
        else if (props.entity){
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
