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
import { defineComponent } from 'vue';
import { IonAvatar, IonCol, IonRow, IonButton, IonPopover, IonContent, IonList, IonListHeader, IonItem } from '@ionic/vue';
import { getUserStore } from '@/modules/user/userStore';
import AuthService from '@/modules/auth/auth.service';
import { useRouter } from 'vue-router';
import router from '@/router';

export default defineComponent({
    components: {IonAvatar, IonCol, IonRow, IonButton, IonPopover, IonList, IonListHeader, IonItem},
    setup() {
        const store = getUserStore();
        const router = useRouter();
        return {store, router};
    },
    methods: {
        logout: () => {
            AuthService.logout();
        },
        debug: () => {
            router.push('/debug')
        }
    
    },
})
</script>

<style scoped>
    .center {
        text-align: center;
    }
</style>
