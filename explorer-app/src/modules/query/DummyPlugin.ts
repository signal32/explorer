import {QueryService} from '@/modules/query/queryService';
import {Plugin, PluginConfig} from '@/modules/plugin/pluginManager';
import {Services} from '@/modules/app/services';
import {GeoEntity} from '@/modules/geo/entity';
import {FeatureCollection, Geometry} from 'geojson';
import dummyEntityList from './dummyData.json';
import {asFeature} from '@/modules/geo/utils';
import {Recommendation, RecommendService} from '@/modules/app/recommendationService';

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

    getById(): Promise<GeoEntity | undefined> {
        return Promise.resolve(entites[0]);
    }

    getByArea(): Promise<FeatureCollection<Geometry, GeoEntity>> {
        return Promise.resolve({
            type: 'FeatureCollection',
            features: entites.map(entity => asFeature(entity)),
        });
    }

    getbyLocation(): Promise<GeoEntity[]> {
        return Promise.resolve(entites);
    }

    recommendForEntity(): Promise<Recommendation[]> {
        return Promise.resolve(entites.map(e => {return {entity: e}}));
    }

    similarity(): Promise<number> {
        return Promise.resolve(0);
    }
}
