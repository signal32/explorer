<template>
 <ion-page>
     <ion-header :translucent="true">
         <ion-toolbar>
             <ion-title>{{ t("auth.authentication") }}</ion-title>
             <ion-buttons slot="start">
                 <ion-back-button></ion-back-button>
             </ion-buttons>
         </ion-toolbar>
     </ion-header>

     <ion-content :fullscreen="true">
         <ion-card >

             <div style="display: flex; align-items: center; justify-content: center;">
             <ion-card-header>
                 <ion-card-title>Explorer</ion-card-title>
             </ion-card-header>
             </div>

             <ion-card-content>
                 <form @submit.prevent="submitForm">
                     <ion-item>
                         <ion-label position="stacked">{{ t("auth.username") }}</ion-label>
                         <ion-input></ion-input>
                     </ion-item>

                     <ion-item>
                         <ion-label position="stacked">{{ t("auth.password") }}</ion-label>
                         <ion-input type="password"></ion-input>
                     </ion-item>

                     <ion-button expand="block" type="submit">
                         {{ t("auth.login") }}
                     </ion-button>
                     <p>{{ t("auth.forgot") }} <a>{{ t("auth.help") }}</a>.</p>
                 </form>
             </ion-card-content>
         </ion-card>

     </ion-content>
 </ion-page>
</template>

<script lang="ts">
import { MessageSchema } from "@/main";
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonButtons,
    IonBackButton} from "@ionic/vue";
import { defineComponent} from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
    components: {
        IonContent,
        IonHeader,
        IonPage,
        IonTitle,
        IonToolbar,
        IonCard,
        IonCardContent,
        IonCardTitle,
        IonCardHeader,
        IonItem,
        IonLabel,
        IonInput,
        IonButton,
        IonButtons,
        IonBackButton,
    },

    setup() {
        const { t } = useI18n<{message: MessageSchema}, 'en-US'>();
        return { t };
    }
})
</script>