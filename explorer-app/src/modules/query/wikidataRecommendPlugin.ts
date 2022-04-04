import {Recommendation, RecommendService} from '@/modules/app/recommendationService';
import {Entity} from '@/modules/geo/entity';
import {Plugin, PluginConfig} from '@/modules/plugin/pluginManager';
import {createAxios} from '@/modules/auth/setup';
import {Services} from '@/modules/app/services';

const axios = createAxios({
    timeout: 1500,
})

export class WikiDataRecommendPlugin implements RecommendService, Plugin {

    private endpoint = process.env.VUE_APP_EXPLORER_RECOMMEND_API || ""; //http://10.1.0.20:8087/api/recommend/";
    private method = 'doc2vec';
    private services: Services | undefined;

    initialise(services: Services): PluginConfig {
        this.services = services;
        return {
            metadata: {
                name: 'WikiData Recommendation Plugin',
                version: '0.0.1',
                description: 'Analyses embeddings within the WikiData knowledge graph to provide recommendations for items that are similar to each other.'
            },
            onEnable: () => services.recommendationService.register(this),
            onDisable: () => services.recommendationService.remove(this),
            params: [
                {
                    name: 'Endpoint',
                    type: 'string',
                    get: () => {
                        return this.endpoint
                    },
                    set: (value) => {
                        this.endpoint = value
                    }
                },
                {
                    name: 'Method',
                    type: 'string',
                    options: ['word2vec', 'doc2vec'],
                    get: () => {
                        return this.method
                    },
                    set: (value) => {
                        this.method = value
                    }
                }
            ]
        };
    }

    recommendForEntity(entity: Entity, limit?: number): Promise<Recommendation[]> {
        return axios.get(this.endpoint + `public/recommend?entity=${entity.id}&limit=50`)
            .then(async res => {
                console.debug('Recommendations received:', res.data);
                const entities: Entity[] = [];

                for (const id of res.data) {
                    const entity = await this.services?.queryService.methods.getById(id);
                    if (entity) entities.push(entity);
                    else console.debug(`Could not get entity with id=${id}, is this a valid entity?`)
                }

                //return entities;
                return [];
            })
    }

    similarity(first: Entity, second: Entity): Promise<number> {
        return Promise.resolve(0);
    }

}
