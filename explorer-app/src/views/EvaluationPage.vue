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
                    <IonButton size="small" fill="outline" @click="installApp">Install Explorer</IonButton>

                    <br>
                    <br>
                    <p>Before starting please read the <a href=" https://1drv.ms/b/s!ApZPGa9fFqtngzsGWdHJ85MJaUKC?e=jWwh3V" target="_blank">Participant Information Sheet</a> and <a href="https://1drv.ms/b/s!ApZPGa9fFqtngzqRjzIfMLk-8_Tf?e=qPoQqA" target="_blank">Research consent form</a>.</p>
                    <i>This research complies with the University of Aberdeen Research Ethics Review Policy.</i>

                </IonCardContent>

            </IonCard>

            <AppTutorial/>

            <IonCard>
                <IonCardContent>
                    <p> Enough for now? See this guide again anytime by tapping the info <IonIcon :icon="informationCircle"/> button.</p>

                    <IonButton expand="block" @click="router.push('/')">Start now!</IonButton>
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
import AppTutorial from '@/components/AppTutorial.vue';
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
            description: 'Installation is not supported on your device.',
            type: NotificationType.TOAST,
        })
    }
}

</script>

<style scoped>

</style>