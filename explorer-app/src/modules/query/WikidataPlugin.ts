import {IQueryPlugin} from '@/modules/plugin/interfaces/queryPlugin';
import {Bindings} from '@comunica/bus-query-operation';
import {DataFactory, NamedNode} from 'rdf-data-factory';
import {newEngine} from '@comunica/actor-init-sparql';
import {LatLng, LatLngBounds} from '@/modules/geo/types';
import {Feature, FeatureCollection, Geometry} from 'geojson';
import {IEntityAbstract, IEntityDetails} from '@/modules/geo/entity';
import testQuery from './sparql/testQuery.sparql';

const engine = newEngine();
const factory = new DataFactory();

enum Filter {
    EXCLUDE,INCLUDE
}

interface Config {
    classFiltering?: Map<Filter, string[]>,
    sparqlEndpoints: string[],
}

interface WikiDataPlugin extends IQueryPlugin {
    config: Config
}

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

function asFeature(feature: IEntityAbstract): Feature<Geometry, IEntityAbstract> {
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [feature.position.lng, feature.position.lat],
        },
        properties: feature,
    }
}


export function defineWikiDataPlugin(config: Config): WikiDataPlugin {
    return {
        config,
        async getAbstractArea(area: LatLngBounds): Promise<FeatureCollection<Geometry, IEntityAbstract>> {
            const newQ = testQuery.replace('?@replaceme', 'wd:Q12280 wd:Q811979 wd:Q3947' )
            const result = await engine.query(newQ, {
                sources: [{type: 'sparql', value: config.sparqlEndpoints[0]}], //todo unbodge
                initialBindings: new (Bindings as any)({
                    '?pointNE': factory.literal(`Point(${area.ne.lng},${area.ne.lat})`, new NamedNode('http://www.opengis.net/ont/geosparql#wktLiteral')),
                    '?pointSW': factory.literal(`Point(${area.sw.lng},${area.sw.lat})`, new NamedNode('http://www.opengis.net/ont/geosparql#wktLiteral')),
/*                    '?included': '{wd:Q12280 wd:Q811979 wd:Q3947}',
                    'excluded': '',
                    'limit': 100,
                    'language' : 'en'*/
                })
            })

            const collection: FeatureCollection<Geometry, IEntityAbstract> = {
                type: 'FeatureCollection',
                features: []
            }

            if (result.type == 'bindings') {
                result.bindingsStream.on('data', b => {
                    console.log(b.get('?subjectTypeLabel').value)
                    collection.features.push(asFeature({
                        position: wktLiteralToLatLng(b.get('?subjectLocation').value),
                        category: {name: b.get('?subjectTypeLabel').value},
                        name: b.get('?subjectLabel').value,
                    }))
                });

                return new Promise(( function (resolve, reject) {

                    result.bindingsStream.on('end', () => {
                        resolve(collection);
                    });
                    result.bindingsStream.on('error', (error) => {
                        console.error('WikiData retrieval failed: ' + error)
                        reject(error);
                    })
                }));
            }

            else return Promise.reject('Result type is not == bindings');

        },

        getAbstract(...items): Promise<IEntityAbstract[]> {
            return Promise.reject('not implemented');
        },


        getDetails(...items): Promise<IEntityDetails> {
            return Promise.reject('not implemented')
        }
    };
}