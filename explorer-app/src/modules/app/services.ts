import {UserService, userService } from '@/modules/auth/userService';
import {getUserPreferencesStore} from '@/modules/auth/entityPreferencesStore';
import { useStore } from '@/modules/app/storage';
import { notificationService, NotificationService } from '@/modules/app/notificationService';
import { RecommendService, recommendationService } from '@/modules/app/recommendationService';
import {AppPluginManager, PluginManager, PluginService} from '@/modules/plugin/pluginManager';
import {Storage} from '@ionic/storage';
import {wikidataRecommendPlugin} from '@/modules/query/wikidataRecommendPlugin';
import {wembedderPlugin} from '@/modules/plugin/wembedderPlugin';
import {queryService, QueryService} from '@/modules/query/queryService';
import {wikidataPlugin} from '@/modules/query/WikidataPlugin';

export interface Services {
    userService: UserService,
    recommendationService: PluginService<RecommendService>,
    queryService: PluginService<QueryService>,
    notificationService: NotificationService,
    store: Storage,
    pluginManager?: PluginManager,
}

const defaultPlugins = [
    wikidataRecommendPlugin,
    wembedderPlugin,
    wikidataPlugin,
]

function defineServices(): Services {
    const partialServices: Services = {
        store: useStore,
        notificationService: notificationService,
        queryService: queryService,
        recommendationService: recommendationService,
        userService: userService,
    }
    const manager = new AppPluginManager(partialServices);

    defaultPlugins.forEach(p => {
        manager.loadPlugin(p)
    })
    partialServices.pluginManager = manager;

    return partialServices;
}

export const services = defineServices();

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