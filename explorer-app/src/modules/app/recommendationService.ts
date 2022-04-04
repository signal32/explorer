import {Entity} from '@/modules/geo/entity';
import {PluginService} from '@/modules/plugin/pluginManager';
import {mean} from 'lodash';

export interface Recommendation {
    entity: Entity,
    reason?: string,
    distance?: number,
    relevance?: 'low' | 'medium' | 'high',
}

export interface RecommendService {
    recommendForEntity(entity: Entity, limit?: number): Promise<Recommendation[]>,
    similarity(first: Entity, second: Entity): Promise<number>,
}

function defineRecommendationService() {
    return new PluginService<RecommendService>((plugins) => {
        return {
            async recommendForEntity(entity: Entity, limit?: number): Promise<Recommendation[]> {
                const entities = new Map<string, Recommendation>();
                for (const plugin of plugins) {
                    const res = await plugin.recommendForEntity(entity, limit);
                    res.forEach(r => entities.set(r.entity.id, r));
                }
                return Array.from(entities.values());
            },

            async similarity(first: Entity, second: Entity): Promise<number> {
                const similarity: number[] = []
                for (const plugin of plugins) {
                    const res = await plugin.similarity(first, second);
                    similarity.push(res);
                }
                return mean(similarity);
            }
        }
    })
}

export const recommendationService = defineRecommendationService();