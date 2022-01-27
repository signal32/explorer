package com.curioustrout.explorer.gis.service;

import org.apache.jena.geosparql.configuration.GeoSPARQLConfig;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdfconnection.RDFConnection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Looks up a location from geographic coordinates
 */
@Service
public class LocationLookupService {

     //private static final Logger LOGGER = LoggerFactory.getLogger(LocationLookupService.class);
     private static final Logger LOGGER = LoggerFactory.getLogger(LocationLookupService.class);

    private static final String WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";
    private static final String QUERY = """
            PREFIX bd: <http://www.bigdata.com/rdf#>
            PREFIX wdt: <http://www.wikidata.org/prop/direct/>
            PREFIX wd: <http://www.wikidata.org/entity/>\s
            PREFIX wikibase: <http://wikiba.se/ontology#>
            SELECT ?item ?itemLabel\s
            WHERE\s
            {
              ?item wdt:P31 wd:Q2934.
              SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }\s
            }""";

    public static void test() {
        var q = QueryFactory.create(QUERY);

        //ar qexev = new QueryEngineHTTP(WIKIDATA_ENDPOINT, q); //depreciated
        // from https://jena.apache.org/documentation/rdfconnection/

        try (var conn = RDFConnection.connect(WIKIDATA_ENDPOINT)) {
            conn.querySelect(q, (solution) -> {
                var subject = solution.getResource("item");
                var name = solution.getLiteral("itemLabel");
                System.out.println(name + subject.toString());
            });

            var d = conn.query(q).execConstructDataset(); // Create new dataset from the query
            var con2 = RDFConnection.connect(d); // New connection for to query.

            // experiment with geosparql https://jena.apache.org/documentation/geosparql/
            GeoSPARQLConfig.setupMemoryIndex();
            var model = conn.query(q).execConstruct();
            try (var qe = QueryExecution.create(q, model)) {
                var rs = qe.execSelect();

            }

        }
    }

    public static void main(String[] args) {
        LOGGER.info("hiya");
        test();
    }


}

