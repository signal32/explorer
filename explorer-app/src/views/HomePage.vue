<template>
  <ion-page>
    <ion-content :fullscreen="true " id="main">

      <ion-tabs>
        <ion-router-outlet></ion-router-outlet>
        <ion-tab-bar slot="bottom">
          <ion-tab-button tab="tab1" href="/view/map">
            <ion-icon :icon="map" />
            <ion-label>Map</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="tab2" href="/view/explore">
            <ion-icon :icon="compass" />
            <ion-label>Explore</ion-label>
          </ion-tab-button>

<!--          <ion-tab-button tab="tab3" href="/view/profile">
            <ion-icon :icon="person" />
            <ion-label>Profile</ion-label>
          </ion-tab-button>-->
        </ion-tab-bar>
      </ion-tabs>
    
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonLabel,
    IonPage,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import {compass, map, person} from 'ionicons/icons';
import LoginStatus from '@/components/LoginStatus.vue'
import {defineComponent} from 'vue';
import {useRouter} from 'vue-router';
import router from '@/router';
import {userService} from '@/modules/auth/userService';
import AuthService from '@/modules/auth/authService';

export default defineComponent({
    components: {
        IonContent,
        IonPage,
        IonTabs, IonTabBar, IonIcon, IonLabel, IonRouterOutlet, IonTabButton,
    },

    setup() {
        const router = useRouter();
        const store = userService;

        return {router, store, map, person, compass};
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
