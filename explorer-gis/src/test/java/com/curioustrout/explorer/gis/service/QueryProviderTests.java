package com.curioustrout.explorer.gis.service;

import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class QueryProviderTests {

    @Autowired
    QueryProvider queryProvider;

    /**
     * @implNote Relies upon external dependency (wikidata endpoint as configured) to pass
     */
    @Test
    void getQuery() {

        var anticipatedQuery = """
                PREFIX  geo:  <http://www.opengis.net/ont/geosparql#>
                PREFIX  bd:   <http://www.bigdata.com/rdf#>
                PREFIX  wdt:  <http://www.wikidata.org/prop/direct/>
                PREFIX  wikibase: <http://wikiba.se/ontology#>
                
                SELECT  ?place ?placeLabel ?location
                WHERE
                  { VALUES ?midPoint { "Point(10.0,10.0)"^^geo:wktLiteral }
                    SERVICE wikibase:around
                      { ?place    wdt:P625         ?location .
                        bd:serviceParam
                                  wikibase:center  ?midPoint ;
                                  wikibase:radius  "1"
                      }
                    SERVICE wikibase:label
                      { bd:serviceParam
                                  wikibase:language  "en"
                      }
                  }
                  """;

        var q = queryProvider.getQuery("example.sparql", Map.ofEntries(
                Map.entry("_pointValue", new Coordinate(10.0,10.0)),
                Map.entry("_radius", "1"),
                Map.entry("_language", "en")
        ));


/*        var q = queryProvider.getQuery("example.sparql", Map.ofEntries(
                Map.entry("_pointValue", String.format("Point(%s, %s)", 10, 10)),
                Map.entry("_radius", String.format("%d", 1)),
                Map.entry("_language", "en")
        ));*/

        assertEquals(anticipatedQuery, q.toString());

    }

}
