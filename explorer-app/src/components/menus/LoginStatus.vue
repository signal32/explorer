<template>
    <div>

    <ion-row class="ion-align-items-center" v-if="store.user">
        <ion-button id="profile-button">
            <ion-col class="center">
                {{store.user.username}}
            </ion-col>
            <ion-col>
                <ion-avatar>
                    <img src="https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y">
                </ion-avatar>
            </ion-col>
        </ion-button>
            <ion-popover trigger="profile-button" trigger-action="click">
                <ion-list>
            <ion-list-header>{{store.user.email}}</ion-list-header>
            <ion-item button @click="logout">Logout</ion-item>
            <ion-item button @click="debug">Debug</ion-item>
            <ion-item button>Showcase</ion-item>
            <ion-item button>GitHub Repo</ion-item>
          </ion-list>
            </ion-popover>
        </ion-row>
    </div>

</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {IonAvatar, IonButton, IonCol, IonItem, IonList, IonListHeader, IonPopover, IonRow} from '@ionic/vue';
import {userService} from '@/modules/auth/userService';
import AuthService from '@/modules/auth/authService';
import {useRouter} from 'vue-router';
import router from '@/router';
import {notificationService} from '@/modules/app/notificationService'
import {NotificationType} from '@/modules/app/notification'

export default defineComponent({
    components: {IonAvatar, IonCol, IonRow, IonButton, IonPopover, IonList, IonListHeader, IonItem},
    setup() {
        const store = userService;
        const router = useRouter();
        const notificationStore = notificationService;

        function logout() {
            AuthService.logout()
            .then(() => {
                notificationStore.pushNotification({title: "You have been logged Out.", type: NotificationType.TOAST})
            })
            .catch(() => {
                notificationStore.pushNotification({title: "An error occurred while logging out. Please try again.", type: NotificationType.TOAST})
            })
        }

        return {store, router, logout};
    },
    methods: {
        debug: () => {
            router.push('/debug')
        },
    
    },
})
</script>

<style scoped>
    .center {
        text-align: center;
    }
</style>
