<template>

    <ion-chip v-for="action in element.actions" :key="action.url" @click="openExternalLink(action.url)">
        {{action.title}}
    </ion-chip>

</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import {ActionDetailElement} from '@/modules/query/detailsService';
import {alertController, IonChip} from '@ionic/vue';

export default defineComponent({
    name: "ActionDetails",
    components: {IonChip},

    props: {
        element: Object as PropType<ActionDetailElement>
    },

    methods: {
        async openExternalLink(url: string) {
            const alert = await alertController.create({
                header: 'External Link',
                message: `You are about visit ${url}. Visit external site?`,
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        cssClass: 'secondary',
                    },
                    {
                        text: 'Visit',
                        handler: () => {
                            window.open(url, '_blank')
                        }
                    }
                ]
            })
            await alert.present();
        }
    }
})
</script>
