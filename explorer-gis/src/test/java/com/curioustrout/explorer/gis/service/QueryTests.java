package com.curioustrout.explorer.gis.service;

import com.curioustrout.explorer.gis.GisServer;
import com.curioustrout.explorer.gis.service.query.LocationSelect;
import com.curioustrout.explorer.gis.service.query.QueryResultParser;
import com.curioustrout.explorer.gis.service.query.WikidataFetcher;
import org.apache.jena.rdfconnection.RDFConnection;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertFalse;

/**
 * Tests specific to each sparql query (default path: resources/sparql/)
 */
@SpringBootTest(classes = GisServer.class)
class QueryTests {

    private static final String WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"; // TODO: 30/01/2022 Get wikidata url from properties 

    @Autowired
    QueryProvider queryProvider;

    @Autowired
    WikidataFetcher wikidataFetcher;

    @Autowired
    QueryResultParser queryResultParser;

    @Test
    void radiusFromCenterDescribe() {
        var q = queryProvider.getQuery("radius_from_center_describe.sparql", Map.ofEntries(
                Map.entry("center", new Coordinate(-2.096472, 57.1443733)),
                Map.entry("radius", "0.1")
        ));

        try (var con = RDFConnection.connect(WIKIDATA_ENDPOINT)) {
            var m = con.queryDescribe(q);
            assertFalse(m.isEmpty());
        }

    }

    @Test
    void locationQuery() {
        var config = new LocationSelect(new Coordinate(-2.096472, 57.1443733), "0.1", "en");
        var result = wikidataFetcher.fetchAndParse(config, queryResultParser);
    }

}
