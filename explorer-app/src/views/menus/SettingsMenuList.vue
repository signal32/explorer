<template>
    <ion-page>
        <standard-header :title="'Settings'"></standard-header>
        <ion-router-outlet></ion-router-outlet>
        <ion-content :fullscreen="true">
            <settings-list :items="items"/>
        </ion-content>

    </ion-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {
    IonPage, IonContent,
    IonList, IonItem, IonIcon, IonLabel, IonRouterOutlet
} from '@ionic/vue';
import {personCircleOutline, extensionPuzzleOutline, bugOutline, optionsOutline} from 'ionicons/icons'
import router from '@/router';
import StandardHeader from '@/components/headers/StandardHeader.vue';
import SettingsList, {SettingsItem} from '@/components/menus/SettingsList.vue';

export default defineComponent({
    name: "SettingsMenuList",
    components: {SettingsList, StandardHeader, IonPage, IonContent, IonRouterOutlet},
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
                path: '/settings/preferences'
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
