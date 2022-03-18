<template>
    <ion-page>
        <standard-header :title="'Settings'"></standard-header>
        <ion-router-outlet></ion-router-outlet>
        <ion-content :fullscreen="true">
            <ion-list>
                <ion-item v-for="item in items" :key="item.title" button @click="router.push(item.path)">
                    <ion-icon slot="start" :icon="item.icon"></ion-icon>
                    <ion-label>
                        <h3>{{ item.title }}</h3>
                    </ion-label>
                </ion-item>
            </ion-list>
        </ion-content>

    </ion-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {
    IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonList, IonItem, IonIcon, IonLabel, IonRouterOutlet
} from '@ionic/vue';
import {personCircleOutline, extensionPuzzleOutline, bugOutline, optionsOutline} from 'ionicons/icons'
import router from '@/router';
import StandardHeader from '@/components/headers/StandardHeader.vue';

export interface SettingsItem {
    title: string,
    icon: string,
    path: string,
}

export default defineComponent({
    name: "SettingsMenuList",
    components: {
        StandardHeader, IonPage, IonContent, IonRouterOutlet,
                IonList, IonItem, IonIcon, IonLabel},
    setup() {

        const items: SettingsItem[] = [
            {
                title: 'Account',
                icon: personCircleOutline,
                path: '/auth'
            },
            {
                title: 'Preferences',
                icon: optionsOutline,
                path: ''
            },
            {
                title: 'Plugins',
                icon: extensionPuzzleOutline,
                path: '/settings/plugins'
            },
            {
                title: 'Debug Information',
                icon: bugOutline,
                path: '/debug'
            },
        ]

        return {items, router}
    }

});
</script>
