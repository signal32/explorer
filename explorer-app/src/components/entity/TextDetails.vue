<template>

    <!-- Display multiple images within a slider -->
    <ion-item>
        <ion-label class="ion-text-wrap">
            <h3>{{element.title}}</h3>
            <p>{{element.body}}</p>
        </ion-label>
    </ion-item>

</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import {TextDetailElement} from '@/modules/query/detailsService';
import {IonItem, IonLabel} from '@ionic/vue';

export default defineComponent({
    name: "TextDetails",
    components: {IonItem, IonLabel},
    props: {
        element: Object as PropType<TextDetailElement>
    }
})
</script>
