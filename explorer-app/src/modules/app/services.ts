import {UserService, userService } from '@/modules/auth/userService';
import { entityPreferenceService, EntityPreferencesService } from '@/modules/auth/entityPreferencesStore';
import { useStore } from '@/modules/app/storage';
import { notificationService, NotificationService } from '@/modules/app/notificationService';
import { RecommendService, recommendationService } from '@/modules/app/recommendationService';
import {AppPluginManager, PluginManager, PluginService} from '@/modules/plugin/pluginManager';
import {Storage} from '@ionic/storage';
import {wikidataRecommendPlugin} from '@/modules/query/wikidataRecommendPlugin';
import {wembedderPlugin} from '@/modules/plugin/wembedderPlugin';
import {queryService, QueryService} from '@/modules/query/queryService';
import {wikidataPlugin} from '@/modules/query/WikidataPlugin';
import {categoryService, CategoryService} from '@/modules/app/categoryService';
import {debugService, DebugService} from '@/modules/app/debugService';
import {defineDetailService, DetailService} from '@/modules/query/detailsService';
import {WikipediaPlugin} from '@/modules/plugin/WikipediaPlugin';

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

const defaultPlugins = [
/*    wikidataRecommendPlugin,*/
    /*wembedderPlugin,*/
    wikidataPlugin,
    new WikipediaPlugin(),
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

    defaultPlugins.forEach(p => {
        manager.loadPlugin(p)
    })
    partialServices.pluginManager = manager;

    postServicesRunners.forEach(runner => runner(partialServices));

    return partialServices;
}

export const services = defineServices();

export function useServices(): Services {
    return services;
}