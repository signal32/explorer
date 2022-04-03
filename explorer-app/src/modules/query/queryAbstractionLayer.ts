import {IQueryResult, newEngine} from '@comunica/actor-init-sparql';
import {DataFactory, NamedNode} from 'rdf-data-factory';
import {LatLng, LatLngBounds} from '@/modules/geo/types';
import {Entity, GeoEntity} from '@/modules/geo/entity';
import {Bindings} from '@comunica/bus-query-operation';
import selectEntity from './sparql/entity/selectEntity.sparql'
import selectArea from './sparql/location/selectArea.sparql'
import selectAreaNamed from './sparql/location/selectAreaNamed.sparql'
import selectLocation from './sparql/location/selectLocation.sparql'
import selectWithSimilarCategories from './sparql/category/selectWithSimilarCategories.sparql'

export type WikiDataId = `wd:${'Q' | `P`}${string | number}`;

const queryEngine = newEngine();
const dataFactory = new DataFactory();

/**
 * Construct an {@link Entity} from its corresponding {@link WikiDataId}
 * @param ids
 * @param endpoint
 */
export async function getEntity(ids: WikiDataId[], endpoint: string): Promise<Entity[]> {
    const query = selectEntity.replace('?@entityIds', ids.join(' '));
    const result  = await queryEngine.query(query, {sources: [{type: 'sparql', value: endpoint}]});

    return bindResults(result, data => {
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
export async function getGeoEntity(ids: WikiDataId[], endpoint: string): Promise<GeoEntity[]> {
    const query = selectEntity.replace('?@entityIds', ids.join(' '));
    const result  = await queryEngine.query(query, {sources: [{type: 'sparql', value: endpoint}]});

    return bindResults(result, data => {
        return {
            id: wikidataIdFromUrl(data.get('?subject').value) || 'UNDEFINED_ID',
            name: data.get('?subjectLabel').value,
            thumbnailUrl: data.get('?subjectImage')?.value,
            position: wktLiteralToLatLng(data.get('?subjectLocation').value),
            category: {
                id:  wikidataIdFromUrl(data.get('?category').value) || 'UNDEFINED_ID',
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

    return bindResults(result, data => {return wikidataIdFromUrl(data.get('?entity').value) || 'UNDEFINED_ID' as WikiDataId })
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

    return bindResults(result, data => {return wikidataIdFromUrl(data.get('?entity').value) || 'UNDEFINED_ID' as WikiDataId })
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
    return bindResults(result, data => {return wikidataIdFromUrl(data.get('?entity').value) || 'UNDEFINED_ID' as WikiDataId })
}

/**
 * Get the IDs of entities that are of similar categories to the provided entity.
 * @param ids
 * @param endpoint
 */
export async function getSimilarByCategory(ids: WikiDataId[], endpoint: string): Promise<WikiDataId[]> {
    const query = selectWithSimilarCategories.replace('?@originEntities', ids.join(''));
    const result = await queryEngine.query(query, {sources: [{type: 'sparql', value: endpoint}]});
    return bindResults(result, data => {return wikidataIdFromUrl(data.get('?entity').value) || 'UNDEFINED_ID' as WikiDataId })
}

export function bindResults<T>(result: IQueryResult, resolver: (data: any) => T): Promise<T[]> {
    const collection: T[] = [];
    if (result.type == 'bindings') {
        return new Promise((resolve, reject) => {
            result.bindingsStream.on('data', (data) => collection.push(resolver(data)));
            result.bindingsStream.on('error', (error) => reject(error));
            result.bindingsStream.on('end', () => {
                resolve(collection);
            });
        })
    }
    else return Promise.reject();
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
function wikidataIdFromUrl(url: string, directOnly = false): WikiDataId | undefined {
    if (directOnly && !url.includes('direct')) return undefined;
    const matches = url.match(/[Q|P]\d*/gm);
    if (matches) {
        return 'wd:' + matches[0] as WikiDataId;
    }
    else return undefined;
}
