import {Quad} from '@/modules/geo/quadtree';
import {LatLngBounds} from '@/modules/geo/types';
import {FeatureCollection, Geometry} from 'geojson';
import {GeoEntity, DetailsEntity, Entity} from '@/modules/geo/entity';
import {services} from '@/modules/app/services';
import {NotificationType} from '@/modules/app/notification';
import {notificationService} from '@/modules/app/notificationService';
import {PluginService} from '@/modules/plugin/pluginManager';


export interface QueryService {
    getById: (id: string) => Promise<GeoEntity | undefined>,
    getByArea(area: LatLngBounds): Promise<FeatureCollection<Geometry, GeoEntity>>,
}

interface QuadInfo {
    name?: string
    queryCache: Map<QueryService, FeatureCollection<Geometry, GeoEntity>>,
    categoriesHash?: string,
}

const tree = new Quad<QuadInfo>({name: 'root', queryCache: new Map<QueryService, FeatureCollection<Geometry, GeoEntity>>()});
const idMap = new Map<string, GeoEntity>();

function defineQueryService() {
    return new PluginService<QueryService>(plugins => {
        return {

            async getById(id): Promise<GeoEntity | undefined> {
                let entity = idMap.get(id);

                if (entity != undefined) return entity;

                for (const p of plugins) {
                    entity = await p.getById(id);
                    if (entity != undefined) {
                        idMap.set(entity.id, entity); //cache this
                        return entity;
                    }
                }
                console.warn(`Entity with id=${id} could not be found`);
                return undefined;
            },

            async getByArea(area: LatLngBounds): Promise<FeatureCollection<Geometry, GeoEntity>> {
                const collection: FeatureCollection<Geometry, GeoEntity> = {
                    type: 'FeatureCollection',
                    features: [],
                };

                for (const quad of tree.findOrCreate(area, 14)) {
                    // Plugins are called to update quads which have been newly created and are still empty.
                    if (!quad.value || quad.value?.categoriesHash != JSON.stringify(services.preferenceService.liked)) {
                        await updateQuad(quad, plugins, area); //todo Make quad updates in parallel
                        quad.value!.categoriesHash = JSON.stringify(services.preferenceService.liked);
                    }

                    // Then geoJson is merged together from each quad
                    quad.value?.queryCache.forEach(item => {
                        collection.features.push(...item.features)
                    })
                }

                return Promise.resolve(collection);
            },

        }
    });
}

export const queryService = defineQueryService();


async function updateQuad(quad: Quad<QuadInfo>, plugins: QueryService[], area: LatLngBounds) {

    if (!quad.value) quad.value = {queryCache: new Map<QueryService, FeatureCollection<Geometry, GeoEntity>>()};

    for (const plugin of plugins) {
        quad.value?.queryCache.set(plugin, await plugin.getByArea(quad.asArea()));
    }
    const quadArea = quad.asArea();
    console.debug(`Updated quad with name = ${quad.value?.name}, cs = ${quadArea.crossSection().toFixed(3)}m, values = `, quad.value);
}
