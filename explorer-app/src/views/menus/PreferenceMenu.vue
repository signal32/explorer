<template>
    <ion-page>
        <standard-header :title="'Preferences'"></standard-header>
        <ion-content :fullscreen="true">
            <settings-list :items="items"/>
        </ion-content>

    </ion-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {IonContent, IonPage} from '@ionic/vue';
import {arrowUndo, colorPalette, heartOutline} from 'ionicons/icons'
import router from '@/router';
import StandardHeader from '@/components/util/StandardHeader.vue';
import SettingsList, {SettingsItem} from '@/components/menus/SettingsList.vue';
import {services} from '@/modules/app/services';
import {NotificationType} from '@/modules/app/notification';

export default defineComponent({
    name: "SettingsMenuList",
    components: {SettingsList, StandardHeader, IonPage, IonContent},
    setup() {

        const items: SettingsItem[] = [
            {
                title: 'My Interests',
                subtitle: 'Choose what you want to see',
                icon: heartOutline,
                path: '/settings/interests'
            },
            {
                title: 'Theme',
                subtitle: 'auto',
                icon: colorPalette,
            },
            {
                title: 'Reset local storage',
                subtitle: 'Reset all data stored on your device',
                icon: arrowUndo,
                action: () => {
                    services.store.clear().then(() => {
                        services.notificationService.pushNotification({
                            title: 'Local storage has been erased',
                            description: 'You may need to restart the app for changes to take effect.',
                            type: NotificationType.TOAST,
                        })
                    });
                }
            },
        ]

        return {items, router}
    }

});
</script>
