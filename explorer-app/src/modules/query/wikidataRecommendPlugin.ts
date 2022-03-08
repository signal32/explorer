import {RecommendService} from '@/modules/app/recommendationService';
import {Entity} from '@/modules/geo/entity';
import {Plugin} from '@/modules/plugin/pluginManager';
import {createAxios} from '@/modules/auth/setup';


interface WikidataRecommendPlugin extends RecommendService, Plugin {
    endpoint?: { value: string },
}

const endpoint = {
    name: 'endpoint',
    value: '',
    default: 'http://10.1.0.20:8087/'
}

const axios = createAxios({
    timeout: 1500,
})

function defineWikidataRecommendPlugin(): WikidataRecommendPlugin {
    return {

        initialise(services) {
            services.recommendationService.register(this);
            this.endpoint = {value: 'undefined'};

            return {
                metadata: {
                    name: 'WikiData Recommendation Plugin',
                    version: '0.0.1',
                    description: 'Analyses embeddings within the WikiData knowledge graph to provide recommendations for items that are similar to each other.'
                },
                configVariables: () => [endpoint]
            }
        },

        recommendForEntity(entity: Entity, limit?: number): Promise<Entity[]> {
            console.log('hello from wikidatarecommendplugin!');

            return axios.get(endpoint.value + `public/recommend?entity=${entity.id}&limit=50` )
                .then(res => {
                    console.log(res.data);
                    const entities: Entity[] = [];
                    res.data.forEach((i: any) => entities.push({
                        id: i, name: 'unnamed ' + i
                    }))
                    return entities;
                })

            //return Promise.resolve([entity]);
        },

        similarity(first: Entity, second: Entity): Promise<number> {
            return Promise.resolve(0);
        }
    }
}

export const wikidataRecommendPlugin = defineWikidataRecommendPlugin();