<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Explorer</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Explorer</ion-title>
        </ion-toolbar>
      </ion-header>
    
      <div id="container">
        <strong>Mapping Placeholder</strong>
        <p>Space for map view using <a target="_blank" rel="noopener noreferrer" href="https://ionicframework.com/docs/components">leaflet</a>.</p>
          <button @click="router.push('/auth')">sign in</button>
          <button @click="logout">logout</button>
          <p>---{{store.user}}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { defineComponent } from 'vue';
import {useRouter} from 'vue-router';
import router from '@/router';
import {getUserStore} from '@/modules/user/userStore';
import AuthService from '@/modules/auth/auth.service';

export default defineComponent({
    components: {
        IonContent,
        IonHeader,
        IonPage,
        IonTitle,
        IonToolbar,
    },

    setup() {
        const router = useRouter();
        const store = getUserStore();

        return {router, store};
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