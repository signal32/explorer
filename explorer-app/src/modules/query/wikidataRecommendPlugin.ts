import {RecommendService} from '@/modules/app/recommendationService';
import {Entity} from '@/modules/geo/entity';
import {Plugin, PluginRunner} from '@/modules/plugin/pluginManager';

export const wikidataReccomendPlugin = new PluginRunner<RecommendService>({
    init(services, instance) {
        services.recommendationService.register(instance);
    },
    defineMethods(config) {
        return {
            recommendForEntity(entity: Entity, limit?: number): Promise<Entity[]> {
                return Promise.resolve([]);
            },

            similarity(first: Entity, second: Entity): Promise<number> {
                return Promise.resolve(0);
            }
        }
    }
})