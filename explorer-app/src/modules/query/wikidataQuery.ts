import {IQueryResult, IQueryResultBindings, newEngine} from '@comunica/actor-init-sparql';
import {DataFactory, NamedNode} from 'rdf-data-factory';
import selectLocationQuery from './sparql/selectLocation.sparql';
import selectLikedQuery from './sparql/selectLiked.sparql';
import selectAreaQuery from './sparql/selectArea.sparql';
import selectEntityQuery from './sparql/selectEntity.sparql';
import  selectByLocationQuery from './sparql/testQueryLocation.sparql';
import {LatLng, LatLngBounds} from '@/modules/geo/types';
import {Bindings} from '@comunica/bus-query-operation';
import {Entity, GeoEntity} from '@/modules/geo/entity';

type WikiDataId = `wd:${'Q' | `P`}${string}`;

const queryEngine = newEngine();
const dataFactory = new DataFactory();

/**
 * Get WikiData entities that are liked
 * @param subject List of entities to evaluate
 * @param include List of category entities that subjects should be subclass of
 * @param exclude List of category entities that subjects should not be subclass of
 * @param endpoint
 */
export async function selectLiked(subject: WikiDataId[], include: WikiDataId[], exclude: WikiDataId[], endpoint: string): Promise<WikiDataId[]> {
    const query = selectLikedQuery
        .replace('?@subject', subject.join(''))
        .replace('?@include', include.join(''))
        .replace('?@exclude', exclude.join(''));

    const result = await queryEngine.query(query, {sources: [{type: 'sparql', value: endpoint}]});

    return new BindingsMapper(result, (data) => {
        return `wd:${data.get('?subject').value}` as WikiDataId;
    })
}

/**
 * Get WikiData entities of a location
 * @param location
 * @param endpoint
 */
export async function selectLocation(location: WikiDataId[], endpoint: string) : Promise<WikiDataId[]> {
    const query = selectLocationQuery.replace('?@locations', location.join(''));
    const result = await queryEngine.query(query, {sources: [{type: 'sparql', value: endpoint}]});

    return new BindingsMapper(result, data => {
        return `wd:${data.get('?subject').value}` as WikiDataId;
    });
}

/**
 * Get WikiData entities and their position
 * @param area
 * @param endpoint
 */
export async function selectArea(area: LatLngBounds, endpoint: string): Promise<{id: WikiDataId, position: LatLng}[]> {
    const result = await queryEngine.query(selectAreaQuery, {
        sources: [{type: 'sparql', value: endpoint}],
        initialBindings: new (Bindings as any)({
            '?pointNE': dataFactory.literal(`Point(${area.ne.lng},${area.ne.lat})`, new NamedNode('http://www.opengis.net/ont/geosparql#wktLiteral')),
            '?pointSW': dataFactory.literal(`Point(${area.sw.lng},${area.sw.lat})`, new NamedNode('http://www.opengis.net/ont/geosparql#wktLiteral')),
        })
    });
    return new BindingsMapper(result,data => {
        return {
            id: `wd:${data.get('?.subject')?.value}` as WikiDataId,
            position: wktLiteralToLatLng(data.get('?location').value)
        }
    })
}

/**
 * Get a WikiData entity as an {@link Entity} instance
 * @param entities
 * @param endpoint
 */
export async function selectEntity(entities: WikiDataId[], endpoint: string): Promise<Entity[]> {
    const query = selectEntityQuery.replace('?@entities', entities.join(''));
    const result = await queryEngine.query(query, {sources: [{type: 'sparql', value: endpoint}]});

    return new BindingsMapper<Entity>(result, data => {
        return {
            id: data.get('?.subject').value,
            name: data.get('?subjectLabel').value,
            thumbnailUrl: data.get('?subjectImage')?.value,
            category: {
                id: data.get('?category').value,
                name: data.get('?categoryLabel').value,
                iconUrl: data.get('?categoryIcon')?.value,
            }
        }
    })
}

/**
 * Get a Wikidata entity as a {@link GeoEntity} instance
 * @param entities
 * @param endpoint
 */
export async function selectGeoEntity(entities: WikiDataId[], endpoint: string): Promise<GeoEntity[]> {
    const query = '';
    const result = await queryEngine.query(query, {sources: [{type: 'sparql', value: endpoint}]});

    return new BindingsMapper<GeoEntity>(result, data => {
        return {
            id: data.get('?subject').value,
            name: data.get('?subjectLabel').value,
            thumbnailUrl: data.get('?subjectImage')?.value,
            position: wktLiteralToLatLng(data.get('?location').value),
            category: {
                id: data.get('?category').value,
                name: data.get('?categoryLabel').value,
                iconUrl: data.get('?categoryIcon')?.value,
            }
        }
    })
}

export async function selectByLocation(location: WikiDataId[], include: WikiDataId[], exclude: WikiDataId[], endpoint: string): Promise<GeoEntity[]> {
    const query = selectByLocationQuery
        .replace('?@location', location.join(' '))
        .replace('?@include', include.join(' '))
        .replace('?@exclude', exclude.join(' '));

    const result = await queryEngine.query(query, {sources: [{type: 'sparql', value: endpoint}]});
    return new BindingsMapper<GeoEntity>(result, data => {
        return {
            id: data.get('?subject').value,
            name: data.get('?subjectLabel').value,
            thumbnailUrl: data.get('?subjectImage')?.value,
            position: wktLiteralToLatLng(data.get('?location').value),
            category: {
                id: data.get('?category').value,
                name: data.get('?categoryLabel').value,
                iconUrl: data.get('?categoryIcon')?.value,
            }
        }
    })

}

export class BindingsMapper<T> extends Promise<T[]> {
    constructor(result:  IQueryResult, resolver: (data: any) => T) {
        super((resolve, reject) => {
            console.log('dd', result);
            if (result.type == 'bindings') {
                const collection: T[] = [];
                result.bindingsStream.on('data', (data) => collection.push(resolver(data)));
                result.bindingsStream.on('error', (error) => reject(error));
                result.bindingsStream.on('end', () => resolve(collection));
            }
            else reject('Result type was not bindings');
        });
    }
}

export function bindResults<T>(result: IQueryResult, resolver: (data: any) => T): Promise<T[]> {
    const collection: T[] = [];
    if (result.type == 'bindings') {
        return new Promise((resolve, reject) => {
            result.bindingsStream.on('data', (data) => collection.push(resolver(data)));
            result.bindingsStream.on('error', (error) => reject(error));
            result.bindingsStream.on('end', () => {
                console.log(collection);
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
