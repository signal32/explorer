<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Explorer</ion-title>

        <div slot="secondary">
          <login-status v-if="store.loggedIn"></login-status>
          <ion-button v-else @click="router.push('/auth')"> Login</ion-button>
        </div>

        
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Explorer</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-tabs>
        <ion-router-outlet></ion-router-outlet>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="tab1" href="/tabs/tab1">
            <ion-icon :icon="map" />
            <ion-label>Map</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="tab2" href="/tabs/tab2">
            <ion-icon :icon="compass" />
            <ion-label>Discover</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="tab3" href="/tabs/tab3">
            <ion-icon :icon="person" />
            <ion-label>Profile</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonTabs, IonTabBar, IonIcon, IonLabel, IonRouterOutlet, IonTabButton, toastController } from '@ionic/vue';
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
        IonTabs, IonTabBar, IonIcon, IonLabel, IonRouterOutlet, IonTabButton
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
