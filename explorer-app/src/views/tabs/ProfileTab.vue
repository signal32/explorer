<template>
  <ion-page>
        <ion-header>
      <ion-toolbar>
        <ion-title>Home</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
        <ion-grid fixed>

        <ion-row class="ion-align-items-center">
            <ion-col size="3" class="">
                    <ion-avatar>
                        <img :src="require('@/assets/user.png')"/>
                    </ion-avatar>
            </ion-col>
            <ion-col>
                <h3>{{userStore?.user?.username || "Guest"}}</h3>
                <ion-button color="medium" size="small" fill="outline" expand="block" @click="notImplementedAlert()">Edit</ion-button>
            </ion-col>

        </ion-row>


        <ion-segment >
            <ion-segment-button value="history" layout="icon-start">
                <ion-label>History</ion-label>
                <ion-icon :icon="historyIcon"></ion-icon>
            </ion-segment-button>
            <ion-segment-button value="saved" layout="icon-start">
                <ion-label>Saved</ion-label>
                <ion-icon :icon="savedIcon"></ion-icon>
            </ion-segment-button>
        </ion-segment>
        </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
    IonAvatar,
    IonButton,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonLabel,
    IonPage,
    IonRow,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar
} from '@ionic/vue';
import {analytics, bookmarkOutline, pencilOutline} from 'ionicons/icons';
import {defineComponent} from 'vue';
import {userService} from '@/modules/auth/userService';
import {notificationService} from '@/modules/app/notificationService';
import {NotificationType} from '@/modules/app/notification';
import {createAxios} from '@/modules/auth/setup';

export default defineComponent({
    components: {
      IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonSegment, IonSegmentButton, IonLabel, IonIcon, IonRow, IonCol, IonAvatar, IonButton, IonGrid,
    },

    setup() {

        const userStore = userService;
        const notificationStore = notificationService;
        async function notImplementedAlert() {
          const axios = createAxios({
              baseURL: "http://10.1.0.20:8081/",
              timeout: 1500
            });

          const config = {
              headers: { Authorization: `Bearer ${userStore.userState?.token}` }
          };
          axios.post("public/user/bio/", prompt('Type here'), config)
          .then(() => {
            axios.get('public/user', config).then((res) => {
                console.log(res.data);
                alert(res?.data?.biography)
            })
          });

          notificationStore.pushNotification({title: "Not implemented", type: NotificationType.TOAST})
        }


        return { userStore, notImplementedAlert,
            historyIcon: analytics, savedIcon: bookmarkOutline, editIcon: pencilOutline};
    }
  });
</script>