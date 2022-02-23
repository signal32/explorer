import {getUserStore} from '@/modules/auth/userStore';
import {getUserPreferencesStore} from '@/modules/auth/entityPreferencesStore';
import {useStore} from '@/modules/app/storage';

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
     * Key-Value store for use by any service.
     */
    commonStore: useStore,
}