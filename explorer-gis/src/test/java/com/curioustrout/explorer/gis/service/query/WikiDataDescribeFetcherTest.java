package com.curioustrout.explorer.gis.service.query;

import com.curioustrout.explorer.gis.geo.Area;
import com.curioustrout.explorer.gis.geo.GeoPosition;
import com.curioustrout.explorer.gis.service.QueryProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class WikiDataDescribeFetcherTest {

    static WikiDataDescribeFetcher.WikiDataDescribeQuery TEST_CONFIG = new WikiDataDescribeFetcher.WikiDataDescribeQuery(
            new GeoPosition(-2.1501791,57.1132776),
            new GeoPosition(-2.096472,57.1443733));

    static GeoQueryConfig GEO_QUERY_CONFIG = new GeoQueryConfig(null, new Area(TEST_CONFIG.pointNe(), TEST_CONFIG.pointSw()), 10);

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