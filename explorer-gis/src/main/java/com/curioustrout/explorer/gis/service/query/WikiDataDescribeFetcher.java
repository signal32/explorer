package com.curioustrout.explorer.gis.service.query;

import com.curioustrout.explorer.core.query.SparqlQuery;
import com.curioustrout.explorer.core.geo.GeoPosition;
import com.curioustrout.explorer.gis.service.ModelProvider;
import com.curioustrout.explorer.gis.service.QueryProvider;
import com.curioustrout.explorer.gis.util.Fetcher;
import com.curioustrout.explorer.gis.util.QueryConfig;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdfconnection.RDFConnection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.FileWriter;

/**
 * Service to provide {@link ModelProvider with data from WikiData}
 */
@Service
public class WikiDataDescribeFetcher implements Fetcher<Model, GeoQueryConfig> {

    /**
     * Query used by this fetcher.
     */
    @SparqlQuery(fileName = "describe_geobox.sparql")
    public record WikiDataDescribeQuery(
            GeoPosition pointSw,
            GeoPosition pointNe
    ) implements QueryConfig {}

    private static final Logger LOGGER = LoggerFactory.getLogger(WikiDataDescribeFetcher.class);
    private static final String ENDPOINT = "https://query.wikidata.org/sparql";

    private final QueryProvider queryProvider;

    public WikiDataDescribeFetcher(QueryProvider queryProvider) {
        this.queryProvider = queryProvider;
    }


    @Override
    public Model fetch(GeoQueryConfig config) {

        var queryConfig = new WikiDataDescribeQuery(config.area().getSw(), config.area().getNe());

        try (var con = RDFConnection.connect(ENDPOINT)) {
            var query = queryProvider.getQuery(queryConfig);
/*            System.out.println(query.toString());
            return ModelFactory.createDefaultModel();*/
            var m = con.query(query).execDescribe();
            //var ds = DatasetFactory.create(m);
            /*var ds = TDBFactory.createDataset("datasets/"+ config.area().toString());
            ds.begin(ReadWrite.WRITE);
            ds.setDefaultModel(m);
            ds.end();
            ds.begin(ReadWrite.READ);
            var m2 = ds.getDefaultModel();
            ds.end();*/
            var out = new FileWriter("testfuckyou.txt");
            m.write(out);

            //var m3 = ModelFactory.createRDFSModel(m);
            var mmm = ModelFactory.createDefaultModel();
            mmm.read("testfuckyou.txt");
            return m;
        }
        catch (Exception e){
            LOGGER.error("Error fetching from Wikidata: {} \n QueryConfig: {}", e.getMessage(), queryConfig);
            return ModelFactory.createDefaultModel();
        }
    }
}
