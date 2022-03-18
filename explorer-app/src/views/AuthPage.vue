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
         <ion-grid fixed >
         <ion-card >

             <div style="display: flex; align-items: center; justify-content: center;">
             <ion-card-header>
                 <ion-card-title>Explorer</ion-card-title>
             </ion-card-header>
             </div>

             <ion-card-content>
                 <form @submit.prevent="login">
                     <ion-item>
                         <ion-label position="stacked">{{ t("auth.username") }}</ion-label>
                         <ion-input v-model="user.username"></ion-input>
                     </ion-item>

                     <ion-item>
                         <ion-label position="stacked">{{ t("auth.password") }}</ion-label>
                         <ion-input v-model="user.password" type="password" @keyup.enter="login"></ion-input>
                     </ion-item>

                     <ion-button expand="block" type="submit">
                         {{ t("auth.login") }}
                     </ion-button>
                     <p>{{ t("auth.forgot") }} <a v-bind:href="authPage">{{ t("auth.help") }}</a>.</p>
                 </form>
             </ion-card-content>
         </ion-card>
         </ion-grid>

         <ion-loading
             :is-open="isOpenRef"
             cssClass="my-custom-class"
             message="Please wait..."
             :duration="10000"
             @didDismiss="isOpenRef = false"
         >
         </ion-loading>

     </ion-content>
 </ion-page>
</template>

<script lang="ts">
import {MessageSchema} from "@/main";
import {
    alertController,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonGrid,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from "@ionic/vue";
import {defineComponent, ref} from "vue";
import {useI18n} from "vue-i18n";
import User from '@/modules/auth/user';
import authService from '@/modules/auth/authService';
import router from '@/router';

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
        IonLoading,
        IonGrid,
    },

    setup() {
        // translation
        const {t} = useI18n<{ message: MessageSchema }, 'en-US'>();
        const user = ref<User>({});
        const authPage = process.env.VUE_APP_EXPLORER_AUTH_API + "account/";

        const isOpenRef = ref(false);

        return {t, isOpenRef, user, authPage};
    },

    methods: {
        login() {
            console.log(`username: ${this.user.username}, password: ${this.user.password}`);
            this.isOpenRef = true
            authService.login(this.user)
            .then(() => {
                this.isOpenRef = false;
                router.back();
                this.user = {};
            })
            .catch(err => {
                this.isOpenRef = false;
                this.presentAlert(err.toString());
            })
            //console.log(this.store.user);
        },
        async presentAlert(msg: string) {
            const alert = await alertController
                .create({
                    cssClass: 'my-custom-class',
                    header: 'Authentication Failure',
                    subHeader: msg,
                    message: 'Please check your login details are correct and try again.',
                    buttons: ['OK'],
                });
            await alert.present();
        },
    },
})
</script>