import {RecommendService} from '@/modules/app/recommendationService';
import {Entity} from '@/modules/geo/entity';
import {Plugin} from '@/modules/plugin/pluginManager';



interface WikidataRecommendPlugin extends RecommendService, Plugin {
    endpoint?: string,
}

function defineWikidataRecommendPlugin(): WikidataRecommendPlugin {
    return {

        initialise(services) {
            services.recommendationService.register(this);

            return {
                metadata: {
                    name: 'WikiData Recommendation Plugin',
                    version: '0.0.1',
                    description: 'Analyses embeddings within the WikiData knowledge graph to provide recommendations for items that are similar to each other.'
                },
                configVariables: () => [{name: 'endpoint', value: this.endpoint, default: "https://query.wikidata.org/sparql"}]
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

export const wikidataRecommendPlugin = defineWikidataRecommendPlugin();