<template>
 <ion-page>
     <ion-header :translucent="true">
         <ion-toolbar>
             <ion-title>Debug Info</ion-title>
             <ion-buttons slot="start">
                 <ion-back-button></ion-back-button>
             </ion-buttons>
         </ion-toolbar>
     </ion-header>

    <ion-content :fullscreen="true">    
        <ion-accordion-group>
            <ion-accordion value="user">
                <ion-item slot="header">
                    <ion-label>User Details</ion-label>
                </ion-item>

                <ion-list slot="content">
                    <ion-item>
                        <ion-label>
                            User Details
                            <p>{{store.user}}</p>
                            <p>loggedIn: {{store.loggedIn}}</p>
                            <button @click="reAuthUser">Re-Authenticate</button>
                        </ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            Access Token
                            <p>{{store.token}}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            Refresh Token
                            <p>{{store.refreshToken}}</p>
                        </ion-label>
                    </ion-item>
                </ion-list>
            </ion-accordion>
            

            <ion-accordion value="App">
                <ion-item slot="header">
                    <ion-label>App</ion-label>
                </ion-item>

                <ion-list slot="content">
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            Env
                            <p>{{env}}</p>
                        </ion-label>
                    </ion-item>
                </ion-list>
            </ion-accordion>

        </ion-accordion-group>


         

     </ion-content>
 </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonLabel, IonList, IonItem, IonBackButton, IonAccordion, IonAccordionGroup } from '@ionic/vue';
import { getUserStore } from '@/modules/user/userStore';
import AuthService from '@/modules/auth/auth.service';
import { getNotificationStore } from '@/modules/notify/notificationStore';
import { NotificationType } from '@/modules/notify/notification';

export default defineComponent({
    components: {IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonLabel, IonList, IonItem, IonBackButton, IonAccordion, IonAccordionGroup },
    setup() {
        const store = getUserStore();
        const env = process.env;
        console.log(env)

        async function reAuthUser() {
            AuthService.refreshLogin()
            .then(() => {
                getNotificationStore().pushNotification({title: "Re-Authentication Success!", type: NotificationType.TOAST});
            })            
        }

        return {store, env, reAuthUser};
    },
})
</script>