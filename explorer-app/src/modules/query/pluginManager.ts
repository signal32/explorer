import {newEngine} from '@comunica/actor-init-sparql';
import {IEntityAbstract, IQueryPlugin} from '@/modules/query/interfaces';
import {Quad} from '@/modules/geo/quadtree';
import {LatLngBounds} from '@/modules/geo/types';
import {FeatureCollection, Geometry} from 'geojson';

export const queryEngine = newEngine();

/*export async function get(query: string): Promise<IQueryResultBindings> {
    let res = <IQueryResultBindings> await engine.query(query, {
        sources: [{ type: 'sparql', value: 'https://query.wikidata.org/sparql'}],
    });
/!*    await res.bindingsStream.forEach(x => {
        console.log(x);
    })*!/
}*/

interface QuadInfo {
    queryCache: Map<IQueryPlugin, IEntityAbstract>,
}

class QueryPluginManager implements IQueryPlugin{

    private tree: Quad<QuadInfo>;
    private plugins: IQueryPlugin[];


    constructor(...plugins: IQueryPlugin[]) {
        this.tree = new Quad<QuadInfo>();
        this.plugins = plugins;
    }

    /**
     * Return all plugins
     * @param items
     */
    getAbstract(...items: [string]): Promise<IEntityAbstract[]> {
        let abstracts: IEntityAbstract[] = [];

        this.plugins.forEach(plugin => {
            if (plugin.getAbstract) {
                plugin.getAbstract(...items)
                    .then(res => abstracts.push(...res))
            }
        })

        return Promise.resolve(abstracts);
    }

    getAbstractArea(area: LatLngBounds): Promise<FeatureCollection<Geometry, IEntityAbstract>> {
        let collection: FeatureCollection<Geometry, IEntityAbstract> = {
            type: 'FeatureCollection',
            features: []
        };

        this.plugins.forEach(plugin => {
            if (plugin.getAbstractArea) {
                plugin.getAbstractArea(area)
                    .then(res => collection.features.push(...res.features)) //todo Improve merging to conform with geoJson standards (i.e bounding box merge)
            }
        })

        return Promise.resolve(collection);
    }

    private updateQuad(quad: Quad<QuadInfo>) {

    }
}


/*
export const getStore = store;
const { type, items } = <IQueryResultBindings> await store.sparql(`
  SELECT * WHERE { ?s <ex://knows> <ex://alice> . }
`);*/