import {IQueryResult, newEngine} from '@comunica/actor-init-sparql';
import {DataFactory, NamedNode} from 'rdf-data-factory';
import {LatLng, LatLngBounds} from '@/modules/geo/types';
import {CategoryEntity, Entity, GeoEntity} from '@/modules/geo/entity';
import {Bindings} from '@comunica/bus-query-operation';
import selectEntity from './sparql/entity/selectEntity.sparql'
import selectArea from './sparql/location/selectArea.sparql'
import selectAreaNamed from './sparql/location/selectAreaNamed.sparql'
import selectLocation from './sparql/location/selectLocation.sparql'
import selectWithSimilarCategories from './sparql/category/selectWithSimilarCategories.sparql'
import selectCategories from './sparql/category/selectCategories.sparql';
import selectSimilarStations from './sparql/transport/selectRelatedStations.sparql';
import selectSimilarArchitecture from './sparql/historic/selectSimilarArchitecture.sparql';

export type WikiDataId = `wd:${'Q' | `P`}${string | number}`| 'UNDEFINED_ID' | undefined;

const queryEngine = newEngine();
const dataFactory = new DataFactory();

/**
 * Promises to execute a resolver on each result binding as they arrive and return an array of results.
 * If duplicate removal is required, use {@link mapResults} instead.
 * @param result
 * @param resolver
 */
export function bindResults<T>(result: IQueryResult, resolver: (data: any) => Promise<T>): Promise<T[]> {
    const collection: T[] = [];
    if (result.type == 'bindings') {
        return new Promise((resolve, reject) => {
            result.bindingsStream.on('data', async (data) => collection.push(await resolver(data)));
            result.bindingsStream.on('error', (error) => reject(error));
            result.bindingsStream.on('end', () => {
                resolve(collection);
            });
        })
    }
    else return Promise.reject();
}

/**
 * Promises to execute a resolver on each result binding as they arrive and return an array of results without duplicate keys
 * If duplicate removal is not required, use {@link bindResults} instead.
 * @param result
 * @param resolver
 */
export function mapResults<T>(result: IQueryResult, resolver: (data: any) => {key: string, value: T }): Promise<T[]> {
    const map = new Map<string, T>();
    if (result.type == 'bindings') {
        return new Promise((resolve, reject) => {
            result.bindingsStream.on('data', (data) =>  {
                const entry = resolver(data);
                map.set(entry.key, entry.value);
            });
            result.bindingsStream.on('error', (error) => reject(error));
            result.bindingsStream.on('end', () => {
                resolve(Array.from(map.values()));
            });
        })
    }
    else return Promise.reject();
}

/**
 * Construct an {@link Entity} from its corresponding {@link WikiDataId}
 * @param ids
 * @param endpoint
 */
export async function getEntity(ids: WikiDataId[], endpoint: string): Promise<Entity[]> {
    const query = selectEntity.replace('?@entityIds', ids.join(' '));
    const result  = await queryEngine.query(query, {sources: [{type: 'sparql', value: endpoint}]});

    return bindResults(result, async data => {
        return {
            id: wikidataIdFromUrl(data.get('?subject').value) || 'UNDEFINED_ID',
            name: data.get('?subjectLabel').value,
            thumbnailUrl: data.get('?subjectImage')?.value,
            category: {
                id:  wikidataIdFromUrl(data.get('?category').value) || 'UNDEFINED_ID',
                name: data.get('?categoryLabel').value,
                iconUrl: data.get('?categoryIcon')?.value,
            }
        }
    });
}

/**
 * Construct an {@link GeoEntity} from its corresponding {@link WikiDataId}
 * @param ids
 * @param endpoint
 */
export async function getGeoEntity(ids: WikiDataId[], endpoint: string, withinRecursionDepth = 0): Promise<GeoEntity[]> {
    const query = selectEntity.replace('?@entityIds', ids.join(' '));
    const result  = await queryEngine.query(query, {sources: [{type: 'sparql', value: endpoint}]});

    return bindResults(result, async data => {

        //const withinItem = (withinRecursionDepth < 3) ? (await getGeoEntity([wikidataIdFromUrl(data.get('?subjectWithin'))], endpoint, withinRecursionDepth + 1)) : undefined
        const within = (data.get('?subjectWithin')?.value)? {
            id: wikidataIdFromUrl(data.get('?subjectWithin').value) || 'UNDEFINED_ID',
            name: data.get('?withinLabel').value,
            position: wktLiteralToLatLng(data.get('?withinLocation').value),
        } : undefined;
        return {
            id: wikidataIdFromUrl(data.get('?subject').value) || 'UNDEFINED_ID',
            name: data.get('?subjectLabel').value,
            thumbnailUrl: data.get('?subjectImage')?.value,
            position: wktLiteralToLatLng(data.get('?subjectLocation').value),
            within,
            category: {
                id: wikidataIdFromUrl(data.get('?category').value) || 'UNDEFINED_ID',
                name: data.get('?categoryLabel').value,
                iconUrl: data.get('?categoryIcon')?.value,
            }
        }
    });
}

/**
 * Get the IDs of entities within an area.
 * @param area Area to search
 * @param included IDs of entities for which instances of will be explicitly included
 * @param excluded IDs of entities for which instances of will be explicitly excluded
 * @param endpoint
 */
export async function getArea(area: LatLngBounds, included: WikiDataId[], excluded: WikiDataId[], endpoint: string): Promise<WikiDataId[]> {
    const query = selectArea
        .replace('?@include', included.join(' '))
        .replace('?@exclude', (excluded.length > 0) ? excluded.join(' ') : 'wd:Q154242');

    const result = await queryEngine.query(query, {
        sources: [{type: 'sparql', value: endpoint}],
        initialBindings: new (Bindings as any)({
            '?pointNE': dataFactory.literal(`Point(${area.ne.lng},${area.ne.lat})`, new NamedNode('http://www.opengis.net/ont/geosparql#wktLiteral')),
            '?pointSW': dataFactory.literal(`Point(${area.sw.lng},${area.sw.lat})`, new NamedNode('http://www.opengis.net/ont/geosparql#wktLiteral')),
        })
    });

    return bindResults(result, async data => {return wikidataIdFromUrl(data.get('?entity').value) || 'UNDEFINED_ID' as WikiDataId })
}

/**
 * Get the IDs of entities within an area that match the provided name/label.
 * This can be much faster than searching the whole area before filtering for a matching name.
 * @param area Area to search
 * @param name Name of entity to find
 * @param included IDs of entities for which instances of will be explicitly included
 * @param excluded IDs of entities for which instances of will be explicitly excluded
 * @param endpoint
 */
export async function getAreaNamed(area: LatLngBounds, name: string, included: WikiDataId[], excluded: WikiDataId[], endpoint: string): Promise<WikiDataId[]> {
    const query = selectAreaNamed
        .replace('?@include', included.join(' '))
        .replace('?@exclude', (excluded.length > 0) ? excluded.join(' ') : 'wd:Q154242')
        .replace('?@label', name);

    const result = await queryEngine.query(query, {
        sources: [{type: 'sparql', value: endpoint}],
        initialBindings: new (Bindings as any)({
            '?pointNE': dataFactory.literal(`Point(${area.ne.lng},${area.ne.lat})`, new NamedNode('http://www.opengis.net/ont/geosparql#wktLiteral')),
            '?pointSW': dataFactory.literal(`Point(${area.sw.lng},${area.sw.lat})`, new NamedNode('http://www.opengis.net/ont/geosparql#wktLiteral')),
        })
    });

    return bindResults(result, async data => {return wikidataIdFromUrl(data.get('?entity').value) || 'UNDEFINED_ID' as WikiDataId })
}

/**
 * Get the IDs of entities within an area.
 * @param location
 * @param included IDs of entities for which instances of will be explicitly included
 * @param excluded IDs of entities for which instances of will be explicitly excluded
 * @param endpoint
 */
export async function getLocation(location: WikiDataId[], included: WikiDataId[], excluded: WikiDataId[], endpoint: string): Promise<WikiDataId[]> {
    const query = selectLocation
        .replace('?@location', location.join(' '))
        .replace('?@include', included.join(' '))
        .replace('?@exclude', (excluded.length > 0) ? excluded.join(' ') : 'wd:Q154242');
    const result = await queryEngine.query(query, {sources: [{type: 'sparql', value: endpoint}]});
    return bindResults(result, async data => {return wikidataIdFromUrl(data.get('?entity').value) || 'UNDEFINED_ID' as WikiDataId })
}

/**
 * Get the IDs of entities that are of similar categories to the provided entity.
 * @param ids
 * @param endpoint
 */
export async function getSimilarByCategory(ids: WikiDataId[], endpoint: string): Promise<WikiDataId[]> {
    const query = selectWithSimilarCategories.replace('?@originEntities', ids.join(' '));
    const result = await queryEngine.query(query, {sources: [{type: 'sparql', value: endpoint}]});
    return bindResults(result, async data => {return wikidataIdFromUrl(data.get('?entity').value) || 'UNDEFINED_ID' as WikiDataId })
}



export async function getCategories(endpoint: string): Promise<CategoryEntity[]> {
    const result = await queryEngine.query(selectCategories, {sources: [{type: 'sparql', value: endpoint}]});
    return bindResults(result, async data => {
        return {
            id: wikidataIdFromUrl(data.get('?target').value) || 'UNDEFINED_ID',
            name: data.get('?label').value,
            iconUrl: data.get('?icon')?.value,
        }
    })
}

interface SimilarStation {
    id: WikiDataId,
    lineId: WikiDataId,
    service?: string,
    connection?: string,
    terminus?: string,
    distance?: number,
}
export async function getSimilarStations(originStations: WikiDataId[], endpoint: string): Promise<SimilarStation[]> {
    const query = selectSimilarStations.replace('?@originStations', originStations.join(' '));
    const result = await queryEngine.query(query, {sources: [{type: 'sparql', value: endpoint}]});
    return mapResults(result, data => {
        return {
            key: wikidataIdFromUrl(data.get('?station').value) as string,
            value: {
                id: wikidataIdFromUrl(data.get('?station').value),
                lineId: wikidataIdFromUrl(data.get('?line').value),
                service: data.get('?serviceLabel')?.value,
                connection: data.get('?lineLabel')?.value,
                terminus: data.get('?terminus')?.value,
                distance: data.get('?distance')?.value,
            }
        }
    })
}

interface SimilarArchitecture {
    id: WikiDataId,
    heritageDesignation?: string,
    architecturalStyle?: string,
    architect?: string,
    distance?: number,
}
export async function getSimilarArchitecture(originStations: WikiDataId[], endpoint: string): Promise<SimilarArchitecture[]> {
    const query = selectSimilarArchitecture.replace('?__origins__', originStations.join(' '));
    const result = await queryEngine.query(query, {sources: [{type: 'sparql', value: endpoint}]});
    return mapResults(result, data => {
        return{
            key: wikidataIdFromUrl(data.get('?place').value) as string,
            value: {
                id: wikidataIdFromUrl(data.get('?place').value),
                heritageDesignation: data.get('?heritageDesignationLabel')?.value,
                architecturalStyle: data.get('?styleLabel')?.value,
                architect: data.get('?architectLabel')?.value,
                distance: data.get('?dist')?.value,
            }
        }
    })
}

/**
 * Convert RDF type wktLiteral to a {@link LatLng} for use internally.
 * @param literal The literal to convert. Of form 'Point(lat, lng)' where lat, lng are numbers.
 */
function wktLiteralToLatLng(literal: string): LatLng {
    const values = literal.match(/-?\d+.\d*/gm);
    if (values) {
        return new LatLng(parseFloat(values[1]), parseFloat(values[0]));
    }
    else {
        console.warn(`Could not convert wktLiteral to LatLng. Value: ${literal}`);
        return new LatLng(0,0);
    }
}

/**
 * Extract WikiData ID, e.g. P317, from a URL.
 * @param url Url of WikiData item. e.g. http://www.wikidata.org/prop/direct/P18
 * @param directOnly Only resolve IDs for URLs which point to linked data directly.
 */
function wikidataIdFromUrl(url: string, directOnly = false): WikiDataId {
    if (directOnly && !url.includes('direct')) return undefined;
    const matches = url.match(/[Q|P]\d*/gm);
    if (matches) {
        return 'wd:' + matches[0] as WikiDataId;
    }
    else return undefined;
}
