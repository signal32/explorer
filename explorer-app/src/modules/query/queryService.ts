import {Quad} from '@/modules/geo/quadtree';
import {LatLngBounds} from '@/modules/geo/types';
import {FeatureCollection, Geometry} from 'geojson';
import {GeoEntity, DetailsEntity} from '@/modules/geo/entity';
import {services} from '@/modules/app/services';
import {NotificationType} from '@/modules/app/notification';
import {notificationService} from '@/modules/app/notificationService';
import {PluginService} from '@/modules/plugin/pluginManager';


export interface QueryService {
    getAbstract(... items: [string]): Promise<GeoEntity[]>,
    getAbstractArea(area: LatLngBounds): Promise<FeatureCollection<Geometry, GeoEntity>>,
    getDetails(... items: [string]): Promise<DetailsEntity>,
}

interface QuadInfo {
    name?: string
    queryCache: Map<QueryService, FeatureCollection<Geometry, GeoEntity>>,
    categoriesHash?: string,
}

const tree = new Quad<QuadInfo>({name: 'root', queryCache: new Map<QueryService, FeatureCollection<Geometry, GeoEntity>>()});

function defineQueryService() {
    return new PluginService<QueryService>(plugins => {
        return {

            getAbstract(...items): Promise<GeoEntity[]> {
                return Promise.reject('not implemented');
            },

            async getAbstractArea(area: LatLngBounds): Promise<FeatureCollection<Geometry, GeoEntity>> {
                const collection: FeatureCollection<Geometry, GeoEntity> = {
                    type: 'FeatureCollection',
                    features: [],
                };

                for (const quad of tree.findOrCreate(area, 12)) {
                    // Plugins are called to update quads which have been newly created and are still empty.
                    if (!quad.value || quad.value?.categoriesHash != JSON.stringify(services.preferenceService.liked)) {
                        notificationService.pushNotification({
                            title: 'Updating map information from WikiData',
                            description: 'This may take some time ☕',
                            type: NotificationType.TOAST
                        }, )
                        await updateQuad(quad, plugins, area); //todo Parcelize quad updates
                        quad.value!.categoriesHash = JSON.stringify(services.preferenceService.liked);
                        //localStorage.setItem('geoQueryCache', );
                    }

                    // Then geoJson is merged together from each quad
                    quad.value?.queryCache.forEach(item => {
                        collection.features.push(...item.features)
                    })
                }

                return Promise.resolve(collection);
            },

            getDetails(...items): Promise<DetailsEntity> {
                return Promise.reject('not implemented');
            },
        }
    });
}

export const queryService = defineQueryService();


async function updateQuad(quad: Quad<QuadInfo>, plugins: QueryService[], area: LatLngBounds) {

    if (!quad.value) quad.value = {queryCache: new Map<QueryService, FeatureCollection<Geometry, GeoEntity>>()};

    for (const plugin of plugins) {
        quad.value?.queryCache.set(plugin, await plugin.getAbstractArea(area));
    }
    const quadArea = quad.asArea();
    console.debug(`Updated quad with name = ${quad.value?.name}, cs = ${quadArea.crossSection().toFixed(3)}m, values = `, quad.value);
}
