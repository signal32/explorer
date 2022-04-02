import {UserService, userService } from '@/modules/auth/userService';
import { entityPreferenceService, EntityPreferencesService } from '@/modules/auth/entityPreferencesStore';
import { useStore } from '@/modules/app/storage';
import { notificationService, NotificationService } from '@/modules/app/notificationService';
import { RecommendService, recommendationService } from '@/modules/app/recommendationService';
import {AppPluginManager, PluginManager, PluginService} from '@/modules/plugin/pluginManager';
import {Storage} from '@ionic/storage';
import {WikiDataRecommendPlugin} from '@/modules/query/wikidataRecommendPlugin';
import {queryService, QueryService} from '@/modules/query/queryService';
import {wikidataPlugin} from '@/modules/query/WikidataPlugin';
import {categoryService, CategoryService} from '@/modules/app/categoryService';
import {debugService, DebugService} from '@/modules/app/debugService';
import {defineDetailService, DetailService} from '@/modules/query/detailsService';
import {WikipediaPlugin} from '@/modules/plugin/WikipediaPlugin';
import {Plugin} from '@/modules/plugin/pluginManager'
import {DummyPlugin} from '@/modules/query/DummyPlugin';

export interface Services {
    userService:            UserService,
    notificationService:    NotificationService,
    preferenceService:      EntityPreferencesService,
    debug:                  DebugService,
    store:                  Storage,
    recommendationService:  PluginService<RecommendService>,
    queryService:           PluginService<QueryService>,
    categoryService:        PluginService<CategoryService>,
    detailService:          DetailService,
    pluginManager?:         PluginManager,
}

/// Plugins which are included with and loaded by the application by default
const defaultPlugins: {plugin: Plugin, enable: boolean}[] = [
    /*wembedderPlugin,*/
    {plugin: wikidataPlugin, enable: true},
    {plugin: new WikipediaPlugin(), enable: true},
    {plugin: new WikiDataRecommendPlugin(), enable: false},
    {plugin: new DummyPlugin(), enable: false}
]

const postServicesRunners: ((services: Services)=> any)[] = [];
export function postServices(run: (services: Services) => any) {
    postServicesRunners.push(run);
}

function defineServices(): Services {
    const partialServices: Services = {
        store:                  useStore,
        userService:            userService,
        notificationService:    notificationService,
        preferenceService:      entityPreferenceService,
        debug:                  debugService,
        queryService:           queryService,
        recommendationService:  recommendationService,
        categoryService:        categoryService,
        detailService:          defineDetailService(),
    }
    const manager = new AppPluginManager(partialServices);

    defaultPlugins.forEach(entry => {
        manager.loadPlugin(entry.plugin, entry.enable)
            .catch(err => console.error(`Failed to load default plugin "${entry.plugin}": ${err}`));
    })
    partialServices.pluginManager = manager;

    postServicesRunners.forEach(runner => runner(partialServices));

    return partialServices;
}

export const services = defineServices();

export function useServices(): Services {
    return services;
}