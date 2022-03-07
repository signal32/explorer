import {IQueryPlugin} from '@/modules/plugin/interfaces/queryPlugin';
import {Quad} from '@/modules/geo/quadtree';
import {LatLngBounds} from '@/modules/geo/types';
import {FeatureCollection, Geometry} from 'geojson';
import {GeoEntity, DetailsEntity} from '@/modules/geo/entity';
import {AppServices} from '@/modules/app/services';
import {NotificationType} from '@/modules/app/notification';
import {notificationService} from '@/modules/app/notificationService';


interface QuadInfo {
    name?: string
    queryCache: Map<IQueryPlugin, FeatureCollection<Geometry, GeoEntity>>,
    categoriesHash?: string,
}

interface QueryPluginManager extends IQueryPlugin{
    plugins: IQueryPlugin[],
    _tree: Quad<QuadInfo>,

}

async function updateQuad(quad: Quad<QuadInfo>, plugins: IQueryPlugin[], area: LatLngBounds) {

    if (!quad.value) quad.value = {queryCache: new Map<IQueryPlugin, FeatureCollection<Geometry, GeoEntity>>()};

    for (const plugin of plugins) {
        quad.value?.queryCache.set(plugin, await plugin.getAbstractArea(area));
    }
    const quadArea = quad.asArea();
    console.log(`Updated quad with name = ${quad.value?.name}, cs = ${quadArea.crossSection().toFixed(3)}m, values = `, quad.value);
}

export function defineQueryPluginManager(plugins: IQueryPlugin[]): QueryPluginManager {
    // Commented out experiment to save cache tree in local storage (to avoid re-fetching external data on each browser refresh. Did not work, needs more time.
/*    const treeString = localStorage.getItem('geoQueryCache');
    let tree: Quad<QuadInfo>;
    if(treeString) tree = JSON.parse(treeString) as Quad<QuadInfo>;
    else tree = new Quad<QuadInfo>({name: 'root', queryCache: new Map<IQueryPlugin, FeatureCollection<Geometry, IEntityAbstract>>()});*/

    return {
        //_tree: tree,
        _tree: new Quad<QuadInfo>({name: 'root', queryCache: new Map<IQueryPlugin, FeatureCollection<Geometry, GeoEntity>>()}),
        plugins,

        getAbstract(...items: [string]): Promise<GeoEntity[]> {
            return Promise.reject(undefined);
        },

        async getAbstractArea(area: LatLngBounds): Promise<FeatureCollection<Geometry, GeoEntity>> {
            const collection: FeatureCollection<Geometry, GeoEntity> = {
                type: 'FeatureCollection',
                features: [],
            };

            for (const quad of this._tree.findOrCreate(area, 12)) {
                console.log(JSON.stringify(AppServices.userPreferencesStore.liked))
                // Plugins are called to update quads which have been newly created and are still empty.
                if (!quad.value || quad.value?.categoriesHash != JSON.stringify(AppServices.userPreferencesStore.liked)) {
                    notificationService.pushNotification({
                       title: 'Updating map information from WikiData',
                        description: 'This may take some time ☕',
                        type: NotificationType.TOAST
                    }, )
                    console.log(`Updating outdated tile ${quad.asArea()}`)
                    await updateQuad(quad, this.plugins, area); //todo Parcelize quad updates
                    quad.value!.categoriesHash = JSON.stringify(AppServices.userPreferencesStore.liked);
                    //localStorage.setItem('geoQueryCache', );
                }

                // Then geoJson is merged together from each quad
                quad.value?.queryCache.forEach(item => {
                    collection.features.push(...item.features)
                })
            }

            return Promise.resolve(collection);
        },

        getDetails(...items: [string]): Promise<DetailsEntity> {
            return Promise.reject(undefined);
        },

    }
}
