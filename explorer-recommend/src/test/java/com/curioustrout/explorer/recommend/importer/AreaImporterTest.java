package com.curioustrout.explorer.recommend.importer;

import com.curioustrout.explorer.core.geo.Area;
import com.curioustrout.explorer.core.query.service.JenaService;
import com.curioustrout.explorer.recommend.processing.Word2VecRecommender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;

@SpringBootTest
class AreaImporterTest {

    @Autowired
    AreaImporter areaImporter;

    @Autowired
    JenaService jenaService;

    @Autowired
    Word2VecRecommender recommender;

    @Test
    void get() throws IOException {
        //var area = Area.of(57.1443733,-2.096472,57.1132776, -2.1501791);
/*        var area = Area.of(57.311617, -1.895488, 56.936209, -2.977261);
        var res = areaImporter.get(area);
        System.out.println(res.isEmpty());
        //word2Vec.extractSentences(res);
        recommender.setup(res);*/
    }
}