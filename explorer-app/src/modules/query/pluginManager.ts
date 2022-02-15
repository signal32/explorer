import {IEntityAbstract, IEntityDetails, IQueryPlugin} from '@/modules/query/interfaces';
import {Quad} from '@/modules/geo/quadtree';
import {LatLngBounds} from '@/modules/geo/types';
import {FeatureCollection, Geometry} from 'geojson';


interface QuadInfo {
    name?: string
    queryCache: Map<IQueryPlugin, FeatureCollection<Geometry, IEntityAbstract>>,
}

interface QueryPluginManager extends IQueryPlugin{
    plugins: IQueryPlugin[],
    _tree: Quad<QuadInfo>,

}

async function updateQuad(quad: Quad<QuadInfo>, plugins: IQueryPlugin[], area: LatLngBounds) {

    if (!quad.value) quad.value = {queryCache: new Map<IQueryPlugin, FeatureCollection<Geometry, IEntityAbstract>>()};

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
        _tree: new Quad<QuadInfo>({name: 'root', queryCache: new Map<IQueryPlugin, FeatureCollection<Geometry, IEntityAbstract>>()}),
        plugins,

        getAbstract(...items: [string]): Promise<IEntityAbstract[]> {
            return Promise.reject(undefined);
        },

        async getAbstractArea(area: LatLngBounds): Promise<FeatureCollection<Geometry, IEntityAbstract>> {
            const collection: FeatureCollection<Geometry, IEntityAbstract> = {
                type: 'FeatureCollection',
                features: [],
            };

            for (const quad of this._tree.findOrCreate(area, 12)) {
                // Plugins are called to update quads which have been newly created and are still empty.
                if (!quad.value) {
                    await updateQuad(quad, this.plugins, area); //todo Parcelize quad updates
                    //localStorage.setItem('geoQueryCache', );
                }

                // Then geoJson is merged together from each quad
                quad.value?.queryCache.forEach(item => {
                    collection.features.push(...item.features)
                })
            }

            return Promise.resolve(collection);
        },

        getDetails(...items: [string]): Promise<IEntityDetails> {
            return Promise.reject(undefined);
        },

    }
}
