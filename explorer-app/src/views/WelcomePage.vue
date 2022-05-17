<template>

    <IonPage>
        <IonContent>
            <h1 style="text-align: center">👋</h1>
            <h1 style="text-align: center">Welcome to Explorer</h1>
            <h5 style="text-align: center">A Geospatial Open Data Browser</h5>
            <IonCard>
                <IonCardHeader>
                    <IonCardTitle>User feedback programme</IonCardTitle>
                    <IonCardSubtitle>Thanks for helping me out by evaluating this app.</IonCardSubtitle>
                </IonCardHeader>

                <IonCardContent>
                    <p>Explorer is an extensible maps application that uses <a href="https://www.wikidata.org" target="_blank">WikiData</a>, an open source knowledge base to query geospatial information.</p>
                    <br>
                    <p>It is designed for mobile devices, where you can install it directly for the best experience. Otherwise it shall run in your web browser.</p>
                    <IonButton size="small" fill="outline" expand="block" @click="installApp">Install Explorer</IonButton>
                </IonCardContent>

            </IonCard>

            <AppTutorial/>

            <IonCard>
                <IonCardContent>
                    <p>Enough for now? See this guide again anytime by tapping the info <IonIcon :icon="informationCircle"/> button.</p>
                    <IonButton expand="block" @click="router.push('/')">Launch App</IonButton>
                </IonCardContent>
            </IonCard>
        </IonContent>
    </IonPage>
</template>

<script setup lang="ts">
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonIcon,
    IonPage
} from '@ionic/vue';
import {informationCircle} from 'ionicons/icons';
import router from '@/router';
import AppTutorial from '@/components/menus/AppTutorial.vue';
import {ref} from 'vue';
import {services} from '@/modules/app/services';
import {NotificationType} from '@/modules/app/notification';

const installEvent = ref<any>();
window.addEventListener('beforeinstallprompt', e => installEvent.value = e);
async function installApp() {
    if (installEvent.value) {
        installEvent.value?.prompt();
        const {outcome} = await installEvent.value.userChoice;
        if (outcome === 'accepted') {
            installEvent.value = undefined;
        }
    }
    else {
        services.notificationService.pushNotification({
            title: 'Unable to install',
            description: 'Installation is not supported from this browser. Please try again from Chrome or Safari.',
            type: NotificationType.TOAST,
        })
    }
}

</script>

<style scoped>

</style>