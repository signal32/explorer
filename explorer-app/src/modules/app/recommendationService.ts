import {Entity} from '@/modules/geo/entity';
import {PluginService} from '@/modules/plugin/pluginManager';
import {mean} from 'lodash';

export interface RecommendService {
    recommendForEntity(entity: Entity, limit?: number): Promise<Entity[]>,
    similarity(first: Entity, second: Entity): Promise<number>,
}

export const recommendationService = new PluginService<RecommendService>((plugins) => {
    return {
        async recommendForEntity(entity: Entity, limit?: number): Promise<Entity[]> {
            const entities: Entity[] = []
            for (const plugin of plugins) {
                const res = await plugin.recommendForEntity(entity, limit);
                entities.push(...res);
            }
            return entities;
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