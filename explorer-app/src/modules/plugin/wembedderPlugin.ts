import {Plugin} from '@/modules/plugin/pluginManager';
import {Recommendation, RecommendService} from '@/modules/app/recommendationService';
import {createAxios} from '@/modules/auth/setup';
import {Entity} from '@/modules/geo/entity';
import {Services} from '@/modules/app/services';

interface WembedderPlugin extends Plugin, RecommendService {}

const api = {
    name: 'api',
    value: '',
    default: 'https://wembedder.toolforge.org'
}

const axios = createAxios({
    timeout: 1500
})

let _services: Services | undefined = undefined;

export const wembedderPlugin: WembedderPlugin = {
    initialise(services) {
        _services = services;
        services.recommendationService.register(this);
        return {
            metadata: {
                name: 'Wembedder Plugin',
                version: '0.0.1',
                description: 'Uses Wembedder service to provide recommendations for items that are similar to each other.'
            },
            configVariables: () => [api]
        };
    },

    recommendForEntity(entity: Entity, limit?: number): Promise<Recommendation[]> {
        return axios.get(api.value + `/api/most-similar/${entity.id}`)
            .then(res => {
                console.log(res.data);
                const entities: Entity[] = [];
                res.data.most_similar.forEach((i: any) => {
                    entities.push({
                        id: i.item,
                        name: 'Unknown ' + i.item

                    })
                })
                return entities.map(e => {return {entity: e}});
            })
            .catch(() => {
                return []
            })
    },

    similarity(first: Entity, second: Entity): Promise<number> {
        return Promise.reject("not implemented");
    }

}