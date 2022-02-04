package com.curioustrout.explorer.gis.service.query;

import com.curioustrout.explorer.gis.service.QueryProvider;
import com.curioustrout.explorer.gis.util.Fetcher;
import com.curioustrout.explorer.gis.util.QueryConfig;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdfconnection.RDFConnection;
import org.springframework.stereotype.Service;

@Service
public class WikidataFetcher implements Fetcher<ResultSet, Object> {

    private static final String WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql";

    private RDFConnection connection; // TODO: 03/02/2022 Implement connection pooling
    private final QueryProvider queryProvider;

    public WikidataFetcher(QueryProvider queryProvider) {
        this.queryProvider = queryProvider;
        this.connection = RDFConnection.connect(WIKIDATA_ENDPOINT);
    }

    @Override
    public ResultSet fetch (Object config) {

        try{
            var query = queryProvider.getQuery(QueryConfig.getQueryName(config), QueryConfig.getConfig(config));
            return connection.query(query).execSelect();
        }
        catch (Exception e) {
            connection = RDFConnection.connect(WIKIDATA_ENDPOINT);
        }

        return null;
    }
}
