import {Plugin, PluginConfig} from '@/modules/plugin/pluginManager';
import {Recommendation, RecommendService} from '@/modules/services/recommendationService';
import {Services} from '@/modules/app/services';
import {constants} from '@/modules/app/constants';
import {Entity} from '@/modules/geo/entity';
import {getEntity, getSimilarArchitecture, WikiDataId} from '@/modules/plugin/queryAbstractionLayer';

const DEFAULT_ENDPOINT = 'https://query.wikidata.org/sparql';

export class HistoricPlugin implements RecommendService, Plugin {

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

    async recommendForEntity(entity: Entity): Promise<Recommendation[]> {
        const result = await getSimilarArchitecture([entity.id as WikiDataId], this.endpoint);

        const origin = result.find(e => {return e.id == entity.id});
        if (origin) result.splice(result.indexOf(origin), 1);

        const entities = await getEntity(result.map(i => i.id), this.endpoint);


        return entities.map(e => {
            const r = result.find(i => {return i.id == e.id});
            const rec: Recommendation = {
                entity: e,
                distance: r?.distance,
            }

            if (r?.heritageDesignation){
                rec.reason = `Also ${r?.heritageDesignation}`;
                rec.relevance = 'low';
            }

            if (r?.architect) {
                rec.reason = `Also designed by ${r?.architect}`;
                rec.relevance = 'high';
            }

            if (r?.architecturalStyle) {
                rec.reason = `Also ${r?.architecturalStyle}`;
                rec.relevance = 'medium';
            }

            return rec;
        });
    }

    similarity(): Promise<number> {
        return Promise.resolve(0);
    }

}