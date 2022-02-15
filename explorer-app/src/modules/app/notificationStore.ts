import {defineStore} from "pinia";
import {Notification, NotificationType} from "./notification";
import {toastController} from '@ionic/vue';

interface NotificationStoreState {
    notifications: Map<NotificationType, Notification[]>
}

const defaultState:NotificationStoreState = {
    notifications: new Map()
}

async function openToast(notification: Notification) {
    const toast = await toastController
        .create({
            header: notification.title,
            message: notification.description,
            duration: 2000
        })  
    return toast.present();
}

export const getNotificationStore = defineStore('notificationStore', {
    state: () => defaultState,

    getters: {
        notificationCount(state) {
            const lengthMap = new Map<NotificationType, number>();
            for (const key of state.notifications.keys()) {
                lengthMap.set(key, state.notifications.get(key)?.length || 0)
            }
            return lengthMap;
        }
    },

    actions: {
        pushNotification(notification: Notification) {
            const temp = this.notifications
            temp.get(notification.type)?.push(notification);
            this.notifications = temp;
            
            openToast(notification);

        },
        popNotification(type: NotificationType) {
            return this.notifications.get(type)?.pop();
        }
    }
})