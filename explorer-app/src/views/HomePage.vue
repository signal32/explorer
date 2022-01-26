<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Explorer</ion-title>

        <ion-buttons slot="primary">
          <login-status v-if="store.loggedIn"></login-status>
          <ion-button v-else @click="router.push('/auth')">Login</ion-button>
        </ion-buttons>

        
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true ">

      <ion-tabs>
        <ion-router-outlet></ion-router-outlet>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="tab1" href="/view/map">
            <ion-icon :icon="map" />
            <ion-label>Map</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="tab2" href="/view/discover">
            <ion-icon :icon="compass" />
            <ion-label>Discover</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="tab3" href="/view/profile">
            <ion-icon :icon="person" />
            <ion-label>Profile</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonTabs, IonTabBar, IonIcon, IonLabel, IonRouterOutlet, IonTabButton, toastController, IonButtons } from '@ionic/vue';
import { map, person, compass } from 'ionicons/icons';
import LoginStatus from '@/components/LoginStatus.vue'
import { computed, defineComponent } from 'vue';
import {useRouter} from 'vue-router';
import router from '@/router';
import {getUserStore} from '@/modules/user/userStore';
import AuthService from '@/modules/auth/auth.service';
import { storeToRefs } from 'pinia';

export default defineComponent({
    components: {
        IonContent,
        IonHeader,
        IonPage,
        IonTitle,
        IonToolbar,
        LoginStatus,
        IonTabs, IonTabBar, IonIcon, IonLabel, IonRouterOutlet, IonTabButton, IonButtons
    },

    setup() {
        const router = useRouter();
        const store = getUserStore();
        const {loggedIn, user, token } = storeToRefs(store);

        return {router, store, loggedIn, user, token, map, person, compass};
    },

    methods: {
        movePage: () => {
            router.push('/auth');
        },
        logout: () => {
            AuthService.logout();
        }
    }


});
</script>
