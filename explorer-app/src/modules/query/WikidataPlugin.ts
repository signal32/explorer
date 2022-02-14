import {IEntityAbstract, IQueryPlugin} from '@/modules/query/interfaces';
import {Bindings} from '@comunica/bus-query-operation';
import {DataFactory, NamedNode} from 'rdf-data-factory';
import {newEngine} from '@comunica/actor-init-sparql';
import {LatLng, LatLngBounds} from '@/modules/geo/types';

const QUERY_TEMPLATE = `
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX bd: <http://www.bigdata.com/rdf#>
SELECT ?place ?location WHERE {
  # Select the two corners for the box, San Jose & Sacramento
  #values ?pointSW {?pointSw}.
  #values ?pointNE {?pointNe} .
  # Use the box service
  SERVICE wikibase:box {
      # Looking for items with coordinate locations(P625)
      ?place wdt:P625 ?location .
      # Set the south west and north east corners of the box
      bd:serviceParam wikibase:cornerSouthWest ?pointSW .
      bd:serviceParam wikibase:cornerNorthEast ?pointNE .
    }
}LIMIT 100`

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
        return new LatLng(parseFloat(values[1]), parseInt(values[0]));
    }
    else {
        console.warn(`Could not convert wktLiteral to LatLng. Value: ${literal}`);
        return new LatLng(0,0);
    }

}

export function defineWikiDataPlugin(config: Config): WikiDataPlugin {
    return {
        config,
        async getAbstractArea(area: LatLngBounds): Promise<IEntityAbstract[]> {

            factory.literal(`Point(${area.ne.lat},${area.ne.lng})`, `geo:wktLiteral`)

            const result = await engine.query(QUERY_TEMPLATE, {
                sources: [{ type: 'sparql', value: config.sparqlEndpoints[0]}], //todo unbodge
                initialBindings: new (Bindings as any) ({
                    '?pointNE' : factory.literal(`Point(${area.ne.lng},${area.ne.lat})`, new NamedNode('http://www.opengis.net/ont/geosparql#wktLiteral')),
                    '?pointSW' : factory.literal(`Point(${area.sw.lng},${area.sw.lat})`, new NamedNode('http://www.opengis.net/ont/geosparql#wktLiteral'))
                })
            })

            const abstracts: IEntityAbstract[] = [];

            if (result.type == 'bindings') {
                console.log('Is bindings type!');
                result.bindingsStream.on('data', b => {
                    abstracts.push({
                        position: wktLiteralToLatLng(b.get('?location').value),
                        category: {name: 'NONE!'},
                        name: b.get('?place').value,
                    })
                    wktLiteralToLatLng(b.get('?location').value);
                    console.log(`Place id: ${b.get('?place').value}`);
                    console.log(`Location id: ${b.get('?location').value}`);
                })
                console.log('Abstracts b', abstracts);
                return abstracts;
            }
            console.log('Abstracts', abstracts);
            return Promise.resolve(abstracts);
        }
    };
}