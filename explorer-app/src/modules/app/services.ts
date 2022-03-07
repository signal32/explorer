import {UserService, userService } from '@/modules/auth/userService';
import {getUserPreferencesStore} from '@/modules/auth/entityPreferencesStore';
import { useStore } from '@/modules/app/storage';
import { notificationService, NotificationService } from '@/modules/app/notificationService';
import { RecommendService, recommendationService } from '@/modules/app/recommendationService';
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
    notificationService: notificationService,
    recommendationService: recommendationService,
    userService: userService,
};


/**
 * Singleton provider of central application services.
 * Defines the concrete API available to plugins.
 */
export const AppServices = {

    /**
     * Global user preferences and operations.
     */
    userPreferencesStore: getUserPreferencesStore(),

}