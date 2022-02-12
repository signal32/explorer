package com.curioustrout.explorer.gis.service.query;

import com.curioustrout.explorer.gis.geo.Area;
import com.curioustrout.explorer.gis.geo.GeoPosition;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class LocationInformationFetcherTest {
    static Area TEST_AREA = new Area(new GeoPosition(-2.1501791,57.1132776), new GeoPosition(-2.096472,57.1443733));
    static GeoQueryConfig CONFIG = new GeoQueryConfig(
            new LocationSelect(TEST_AREA.midPoint(), "0.5", "en"),
            TEST_AREA,
            1
    );

    @Autowired
    LocationInformationFetcher fetcher;

    @Test
    void fetch() {
        var result = fetcher.fetch(CONFIG);

    }
}