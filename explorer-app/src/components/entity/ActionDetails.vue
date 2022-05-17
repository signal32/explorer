<template>
    <ion-item v-if="element.actions.length > 0">
        <ion-chip v-for="action in element.actions" :key="action.url" @click="openExternalLink(action.url)">
            {{action.title}}
        </ion-chip>
    </ion-item>

</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import {ActionDetailElement} from '@/modules/services/detailsService';
import {alertController, IonChip, IonItem} from '@ionic/vue';

export default defineComponent({
    name: "ActionDetails",
    components: {IonChip, IonItem},

    props: {
        element: Object as PropType<ActionDetailElement>
    },

    methods: {
        async openExternalLink(url: string) {
            const domain = url.match(/(?:[\w-]+\.)+[\w-]+/g)?.[0];
            const alert = await alertController.create({
                header: 'Leaving Explorer',
                message: `You are about visit:\n ${domain || url}`,
                buttons: [
                    {
                        text: 'Cancel',
                    },
                    {
                        text: 'Continue',
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
