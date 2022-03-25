<template>
    <ion-list v-if="items">
        <ion-item v-for="item in items" :key="item.title" button @click="onClick(item)">
            <ion-icon v-if="item.icon" :icon="item.icon" slot="start"/>
            <ion-label >
                <h3>{{ item.title }}</h3>
                <p>{{item.subtitle}}</p>
            </ion-label>
        </ion-item>
    </ion-list>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import {IonList, IonItem, IonIcon, IonLabel} from '@ionic/vue';
import router from '@/router';

export interface SettingsItem {
    title: string,
    subtitle?: string,
    icon?: string,
    value?: any,
    action?: () => any,
    path?: string,
}

export default defineComponent({
    name: "SettingsList",
    components: {IonList, IonItem, IonIcon, IonLabel},
    props: { items: Object as PropType<SettingsItem[]>},
    methods: {
        onClick(item: SettingsItem) {
            if (item.path) router.push(item.path);
            if (item.action) item.action();
        }
    },
    setup() {return {router}}
});
</script>
