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
    wikidataRecommendPlugin,
    /*wembedderPlugin,*/
    wikidataPlugin,
]

function defineServices(): Services {
    const partialServices: Services = {
        userService:            userService,
        notificationService:    notificationService,
        preferenceService:      entityPreferenceService,
        debug:                  debugService,
        store:                  useStore,
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

    return partialServices;
}

export const services = defineServices();
