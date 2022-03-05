import {getUserService, getUserStore, UserService} from '@/modules/auth/userStore';
import {getUserPreferencesStore} from '@/modules/auth/entityPreferencesStore';
import {useStore} from '@/modules/app/storage';
import {getNotificationService, getNotificationStore, NotificationService} from '@/modules/app/notificationStore';
import {recommendationService, RecommendService} from '@/modules/app/recommendationService';
import {PluginService} from '@/modules/plugin/pluginManager';
import {Storage} from '@ionic/storage';

export interface Services {
    userService: UserService,
    recommendationService: PluginService<RecommendService>,
    notificationService: NotificationService,
    store: Storage,
}

export const services: Services = {
    store: useStore,
    notificationService: getNotificationService(),
    recommendationService: recommendationService,
    userService: getUserService(),
}

/**
 * Singleton provider of central application services.
 * Defines the concrete API available to plugins.
 */
export const AppServices = {

    /**
     * User details storage and operations.
     */
    userStore: getUserStore(),

    /**
     * Global user preferences and operations.
     */
    userPreferencesStore: getUserPreferencesStore(),

    /**
     * Storage and service for sending and reading notifications.
     */
    notificationStore: getNotificationStore(),

    /**
     * Key-Value store for use by any service.
     */
    commonStore: useStore,
}