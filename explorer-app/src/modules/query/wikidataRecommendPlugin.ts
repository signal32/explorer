import {RecommendService} from '@/modules/app/recommendationService';
import {Entity} from '@/modules/geo/entity';
import {Plugin} from '@/modules/plugin/pluginManager';



interface WikidataRecommendPlugin extends RecommendService, Plugin {
    endpoint?: string,
}

export function defineWikidataRecommendPlugin(): WikidataRecommendPlugin {
    return {

        initialise(services) {
            services.recommendationService.register(this);

            return {
                metadata: {name: 'WikiData Recommendation Plugin'},
                configVariables: () => [{name: 'endpoint', value: this.endpoint, default: "yeet"}]
            }
        },

        recommendForEntity(entity: Entity, limit?: number): Promise<Entity[]> {
            return Promise.resolve([]);
        },

        similarity(first: Entity, second: Entity): Promise<number> {
            return Promise.resolve(0);
        }
    }
}