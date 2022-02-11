package com.curioustrout.explorer.gis.service.query;

import com.curioustrout.explorer.gis.service.QueryProvider;
import com.curioustrout.explorer.gis.util.GeoArea;
import com.curioustrout.explorer.gis.util.Position;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class WikiDataDescribeFetcherTest {

    static WikiDataDescribeFetcher.WikiDataDescribeQuery TEST_CONFIG = new WikiDataDescribeFetcher.WikiDataDescribeQuery(
            new Position(-2.1501791,57.1132776),
            new Position(-2.096472,57.1443733));

    static GeoQueryConfig GEO_QUERY_CONFIG = new GeoQueryConfig(new GeoArea(TEST_CONFIG.pointNe(), TEST_CONFIG.pointSw()), 10);

    @Autowired
    QueryProvider queryProvider;

    @Autowired
    WikiDataDescribeFetcher fetcher;

    @Test
    void wikidataDescribeQueryTest() {
        assertDoesNotThrow(() -> queryProvider.getQuery(TEST_CONFIG));
    }

    @Test
    void fetchTest() {
        var result = fetcher.fetch(GEO_QUERY_CONFIG);
        assertTrue(result.listStatements().hasNext(), "Query returned no results. This smells bad.");
        //result.listStatements().forEachRemaining(i -> System.out.println(i.asTriple().toString()));
    }

}