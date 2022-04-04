import {Plugin, PluginConfig} from '@/modules/plugin/pluginManager';
import {DetailElement, DetailServiceFormatPlugin} from '@/modules/query/detailsService';
import {Recommendation, RecommendService} from '@/modules/app/recommendationService';
import {Services} from '@/modules/app/services';
import {constants} from '@/constants';
import {Entity} from '@/modules/geo/entity';
import {Quad} from '@rdfjs/types';
import {getEntity, getSimilarStations, WikiDataId} from '@/modules/query/queryAbstractionLayer';

const DEFAULT_ENDPOINT = 'https://query.wikidata.org/sparql';

/**
 * Provides detailed information and recommendations for transport related entities.
 * Uses WikiData knowledge base.
 */
export class TransportPlugin implements DetailServiceFormatPlugin, RecommendService, Plugin {

    constructor(private endpoint: string = DEFAULT_ENDPOINT) {}

    initialise(services: Services): PluginConfig {
        return {
            metadata: {
                name: 'Transport',
                description: 'Provides detailed information and recommendations for transport related places.',
                version: constants.version
            },
            params: [
                {
                    name: 'WikiData endpoint',
                    type: 'string',
                    get: () => this.endpoint,
                    set: (value) => this.endpoint = value,
                }
            ],
            onEnable: () => {
                services.recommendationService.register(this);
                services.detailService.format.register(this);
            },
            onDisable: () => {
                services.recommendationService.remove(this);
                services.detailService.format.remove(this);
            }
        };
    }

    format(entity: Entity, knowledge: Quad[]): Promise<DetailElement[]> {
        return Promise.resolve([]);
    }

    async recommendForEntity(entity: Entity, limit?: number): Promise<Recommendation[]> {
        const result = await getSimilarStations([entity.id as WikiDataId], this.endpoint);

        // Extract original entity and remove from array.
        const origin = result.find(e => {return e.id == entity.id})
        if (origin) result.splice(result.indexOf(origin), 1);

        // Construct entities from remaining IDs
        const entities = await getEntity(result.map(i => i.id), this.endpoint);

        return entities.map(e => {
            const r = result.find(i => {return i.id == e.id});
            const recommendation: Recommendation = {
                entity: e,
                distance: r?.distance
            };

            if (r?.connection == origin?.connection){
                recommendation.reason = 'Same line';
                recommendation.relevance = 'high';
            }

            else if (r?.connection) {
                recommendation.reason = `Via ${r.connection}`;
                recommendation.relevance = 'medium';
            }

            else if (r?.service) {
                recommendation.reason = `On ${r.service}`;
                recommendation.relevance = 'medium';
            }

            return recommendation;

        })
    }

    similarity(first: Entity, second: Entity): Promise<number> {
        return Promise.resolve(0);
    }
}
