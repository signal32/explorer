import {Plugin, PluginConfig} from '@/modules/plugin/pluginManager';
import {DetailElement, DetailServiceFormatPlugin} from '@/modules/query/detailsService';
import {RecommendService} from '@/modules/app/recommendationService';
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

    async recommendForEntity(entity: Entity, limit?: number): Promise<Entity[]> {
        const result = await getSimilarStations([entity.id as WikiDataId], this.endpoint);
        const seen: WikiDataId[] = [];
        //result.map(i => i.id);
        return getEntity(result.filter(i => {if (seen.includes(i.id)) return false; else {seen.push(i.id); return true}}).map(i => i.id), this.endpoint);

    }

    similarity(first: Entity, second: Entity): Promise<number> {
        return Promise.resolve(0);
    }
}
