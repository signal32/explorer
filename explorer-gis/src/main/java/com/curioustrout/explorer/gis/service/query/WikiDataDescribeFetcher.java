package com.curioustrout.explorer.gis.service.query;

import com.curioustrout.explorer.gis.service.ModelProvider;
import com.curioustrout.explorer.gis.service.QueryProvider;
import com.curioustrout.explorer.gis.util.Fetcher;
import com.curioustrout.explorer.gis.util.Position;
import com.curioustrout.explorer.gis.util.QueryConfig;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdfconnection.RDFConnection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Service to provide {@link ModelProvider with data from WikiData}
 */
@Service
public class WikiDataDescribeFetcher implements Fetcher<Model, GeoQueryConfig> {

    /**
     * Query used by this fetcher.
     */
    @SparqlQuery(fileName = "somewhere/over/the/rainbow")
    public record WikiDataDescribeQuery(
            Position pointSw,
            Position pointNe
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
            return con.query(query).execDescribe();
        }
        catch (Exception e){
            LOGGER.error("Error fetching from Wikidata: {} \n QueryConfig: {}", e.getMessage(), queryConfig);
            return ModelFactory.createDefaultModel();
        }
    }
}
