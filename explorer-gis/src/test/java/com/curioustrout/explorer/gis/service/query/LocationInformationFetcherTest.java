package com.curioustrout.explorer.gis.service.query;

import com.curioustrout.explorer.core.geo.Area;
import com.curioustrout.explorer.core.geo.GeoPosition;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class LocationInformationFetcherTest {
    static Area TEST_AREA = new Area(new GeoPosition(57.1495957,-2.0974443), new GeoPosition(57.1457283,-2.0996519));
    static Area TEST_AREA_SMALL = Area.fromPosition(new GeoPosition(57.1401693,-2.0992784), 0.5);
    static GeoQueryConfig CONFIG = new GeoQueryConfig(
            new LocationSelect(TEST_AREA.midPoint(), "0.5", "en"),
            TEST_AREA,
            1
    );

    @Autowired
    LocationInformationFetcher fetcher;

    @Autowired
    QueryResultParser parser;

    @Test
    void fetch() {
        var res = fetcher.fetchAndParse(CONFIG, parser);
        //result.forEachRemaining(r -> r.toString());

    }
}