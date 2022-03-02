import {getUserStore} from '@/modules/auth/userStore';
import {getUserPreferencesStore} from '@/modules/auth/entityPreferencesStore';
import {useStore} from '@/modules/app/storage';
import {getNotificationStore} from '@/modules/app/notificationStore';

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