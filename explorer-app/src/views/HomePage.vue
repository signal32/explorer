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
            <ion-icon :icon="triangle" />
            <ion-label>Tab 1</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="tab2" href="/tabs/tab2">
            <ion-icon :icon="ellipse" />
            <ion-label>Tab 2</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="tab3" href="/tabs/tab3">
            <ion-icon :icon="square" />
            <ion-label>Tab 3</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    
      <div id="container">
        <strong>Mapping Placeholder</strong>
        <p>Space for map view using <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">leaflet</a>.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonTabs, IonTabBar, IonIcon, IonLabel, IonRouterOutlet, IonTabButton, toastController } from '@ionic/vue';
import { ellipse, square, triangle } from 'ionicons/icons';
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

        return {router, store, loggedIn, user, token, ellipse, square, triangle};
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

<style scoped>
#container {
  text-align: center;
  
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  
  color: #8c8c8c;
  
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>