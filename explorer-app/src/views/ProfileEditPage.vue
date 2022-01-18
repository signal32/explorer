<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-title>Edit Profile</ion-title>
                <ion-buttons slot="start">
                    <ion-back-button></ion-back-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">

            <form @submit.prevent="login">
                <ion-item>
                    <ion-label position="stacked">{{ t("auth.username") }}</ion-label>
                    <ion-input v-model="user.username"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-label position="stacked">{{ t("auth.username") }}</ion-label>
                    <ion-input></ion-input>
                </ion-item>


                <ion-button expand="block" type="submit">
                    {{ t("auth.login") }}
                </ion-button>
                <p>{{ t("auth.forgot") }} <a v-bind:href="authPage">{{ t("auth.help") }}</a>.</p>
            </form>




        </ion-content>
    </ion-page>
    
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent } from '@ionic/vue';
import { getUserStore } from '@/modules/user/userStore';
import User from '@/modules/user/user';

export default defineComponent({
    setup() {
        const userStore = getUserStore();
        const user = ref(userStore?.user || {});

        return { user }
        
    },
})
</script>
