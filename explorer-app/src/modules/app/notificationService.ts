import {Notification, NotificationType} from "./notification";
import {toastController} from '@ionic/vue';
import {reactive} from 'vue';
import {Store} from '@/modules/util/store';

async function openToast(notification: Notification) {
    const toast = await toastController
        .create({
            header: notification.title,
            message: notification.description,
            duration: 2000
        })  
    return toast.present();
}

export interface NotificationService {
    notifications: Map<NotificationType, Notification[]>,
    pushNotification(notification: Notification): any,
}

function defineNotificationService(): NotificationService {

    const obj: NotificationService = {
        notifications: new Map(),

        pushNotification(notification: Notification): any {
            const notifications = this.notifications.get(notification.type);
            if (notifications) {
                notifications.push(notification);
            }
            else {
                this.notifications.set(notification.type, [notification])
            }

            openToast(notification);
        }
    }

    return reactive(obj);
}

export const notificationService = defineNotificationService();

class NotificatIionServiceStore extends Store<NotificationService> {
    protected data(): NotificationService {
        return {
            notifications: new Map(),

            pushNotification(notification: Notification): any {
                const notifications = this.notifications.get(notification.type);
                if (notifications) {
                    notifications.push(notification);
                }
                else {
                    this.notifications.set(notification.type, [notification])
                }

                openToast(notification);
            }
        }
    }
}

export const notificationService2 = new NotificatIionServiceStore();