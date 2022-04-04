import {Plugin, PluginConfig} from '@/modules/plugin/pluginManager';
import {DetailElement, DetailServiceFormatPlugin} from '@/modules/query/detailsService';
import {RecommendService} from '@/modules/app/recommendationService';
import {Services} from '@/modules/app/services';
import {constants} from '@/constants';
import {Entity} from '@/modules/geo/entity';
import {Quad} from '@rdfjs/types';
import {getEntity, getSimilarArchitecture, getSimilarStations, WikiDataId} from '@/modules/query/queryAbstractionLayer';

const DEFAULT_ENDPOINT = 'https://query.wikidata.org/sparql';

export class HistoricPlugin implements /*DetailServiceFormatPlugin, */RecommendService, Plugin {

    constructor(private endpoint: string = DEFAULT_ENDPOINT) {}

    initialise(services: Services): PluginConfig {
        return {
            metadata: {
                name: 'Historic',
                description: 'Provides detailed historical information and recommendations for places.',
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
                //services.detailService.format.register(this);
            },
            onDisable: () => {
                services.recommendationService.remove(this);
                //services.detailService.format.remove(this);
            }
        };
    }

    async recommendForEntity(entity: Entity, limit?: number): Promise<Entity[]> {
        const result = await getSimilarArchitecture([entity.id as WikiDataId], this.endpoint);
        return getEntity(result.map(i => i.id), this.endpoint);
    }

    similarity(first: Entity, second: Entity): Promise<number> {
        return Promise.resolve(0);
    }

}