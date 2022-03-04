import {RecommendService} from '@/modules/app/recommendationService';
import {Entity} from '@/modules/geo/entity';
import {Plugin} from '@/modules/plugin/pluginManager';

export function defineWikidataRecommendPlugin(): RecommendService & Plugin {
    return {

        initialise(services) {
            services.recommendationService.register(this);
        },

        recommendForEntity(entity: Entity, limit?: number): Promise<Entity[]> {
            return Promise.resolve([]);
        },

        similarity(first: Entity, second: Entity): Promise<number> {
            return Promise.resolve(0);
        }
    }
}