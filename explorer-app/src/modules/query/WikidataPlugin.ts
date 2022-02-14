import {IEntityAbstract, IQueryPlugin} from '@/modules/query/interfaces';
import {Bindings} from '@comunica/bus-query-operation';
import {DataFactory} from 'rdf-data-factory';
import {newEngine} from '@comunica/actor-init-sparql';
import {LatLngBounds} from '@/modules/geo/types';

const QUERY_TEMPLATE = `
SELECT ?place ?location WHERE {
  # Select the two corners for the box, San Jose & Sacramento
  values ?pointSW {"Point(-2.1501791,57.1132776)"^^geo:wktLiteral}.
  values ?pointNE {"Point(-2.096472,57.1443733)"^^geo:wktLiteral} .
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

export function defineWikiDataPlugin(config: Config): WikiDataPlugin {
    return {
        config,
        async getAbstractArea(area: LatLngBounds): Promise<IEntityAbstract[]> {

            const result = await engine.query(QUERY_TEMPLATE, {
                sources: [{ type: 'sparql', value: config.sparqlEndpoints[0]}], //todo do this better
                initialBindings: new (Bindings as any) ({
                    '?pointNe' : factory.literal(`Point(${area.ne.lat},${area.ne.lng})`),
                    '?pointSw' : factory.literal(`Point(${area.sw.lat},${area.sw.lng})`),
                })
            })

            if (result.type == 'bindings') {
                result.bindingsStream.on('data', b => {
                    console.log(`Place id: ${b.get('?item').value}`);
                    console.log(`Location id: ${b.get('?location').value}`);
                })
            }

            return Promise.resolve([]);
        }
    };
}