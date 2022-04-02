import {QueryService} from '@/modules/query/queryService';
import {Plugin, PluginConfig, PluginParam} from '@/modules/plugin/pluginManager';
import {Services} from '@/modules/app/services';
import {CategoryEntity, Entity, GeoEntity} from '@/modules/geo/entity';
import {LatLngBounds} from '@/modules/geo/types';
import {FeatureCollection, Geometry} from 'geojson';
import dummyEntityList from './dummyData.json';
import {asFeature} from '@/modules/geo/utils';
import {RecommendService} from '@/modules/app/recommendationService';

const entites: GeoEntity[] = dummyEntityList;

export class DummyPlugin implements QueryService, RecommendService, Plugin {

    initialise(services: Services): PluginConfig {
        return {
            metadata: {
                name: 'DummyPlugin',
                description: 'Provides dummy data for testing',
            },
            onEnable: () => {
                services.queryService.register(this);
                services.recommendationService.register(this);
            },
            onDisable: () => {
                services.queryService.remove(this);
                services.recommendationService.remove(this);
            },
        }
    }

    getById(id: string): Promise<GeoEntity | undefined> {
        return Promise.resolve(entites[0]);
    }

    getByArea(area: LatLngBounds, categories?: CategoryEntity[], name?: string, cache?: boolean): Promise<FeatureCollection<Geometry, GeoEntity>> {
        return Promise.resolve({
            type: 'FeatureCollection',
            features: entites.map(entity => asFeature(entity)),
        });
    }

    getbyLocation(location: GeoEntity): Promise<GeoEntity[]> {
        return Promise.resolve(entites);
    }

    recommendForEntity(entity: Entity, limit?: number): Promise<Entity[]> {
        return Promise.resolve(entites);
    }

    similarity(first: Entity, second: Entity): Promise<number> {
        return Promise.resolve(0);
    }




}