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
                            <p>{{store.userState.user}}</p>
                            <p>loggedIn: {{store.userState.loggedIn}}</p>
                            <button @click="reAuthUser">Re-Authenticate</button>
                        </ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            Access Token
                            <p>{{store.userState.token}}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            Refresh Token
                            <p>{{store.userState.refreshToken}}</p>
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

            <!-- Additional parameters shown programmatically via the debug service -->
            <ion-accordion v-for="[scope, items] in services.debug.diagnostics" :key="scope" :value="scope">
                <ion-item slot="header">
                    <ion-label>{{ startCase(scope) }}</ion-label>
                </ion-item>
                <ion-list v-for="item in items" :key="item.name" slot="content">
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            {{ item.name }}
                            <div v-if="item.type=='map'">
                                <div v-for="[key, value] in item.values" :key="key">
                                    <p>{{key}}: {{value}}</p>
                                </div>
                            </div>
                            <p v-else v-for="value in item.values" :key="value">{{value}}</p>
                        </ion-label>
                    </ion-item>
                </ion-list>

            </ion-accordion>

        </ion-accordion-group>


         

     </ion-content>
 </ion-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {
    IonAccordion,
    IonAccordionGroup,
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import {userService} from '@/modules/auth/userService';
import AuthService from '@/modules/auth/authService';
import {notificationService} from '@/modules/app/notificationService';
import {NotificationType} from '@/modules/app/notification';
import {services} from '@/modules/app/services';
import {startCase} from 'lodash';

export default defineComponent({
    components: {IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonLabel, IonList, IonItem, IonBackButton, IonAccordion, IonAccordionGroup },
    setup() {
        const env = process.env;
        console.log(env)
        const store = userService;

        async function reAuthUser() {
            AuthService.refreshLogin()
            .then(() => {
                notificationService.pushNotification({title: "Re-Authentication Success!", type: NotificationType.TOAST});
                console.log(userService.userState.user)
            })
        }

        return {store, env, reAuthUser, services, startCase};
    },
})
</script>