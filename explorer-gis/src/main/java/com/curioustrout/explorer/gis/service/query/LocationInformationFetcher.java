package com.curioustrout.explorer.gis.service.query;

import com.curioustrout.explorer.gis.service.ModelProvider;
import com.curioustrout.explorer.gis.service.QueryProvider;
import com.curioustrout.explorer.gis.util.Fetcher;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.ResultSet;
import org.springframework.stereotype.Service;

@Service
public class LocationInformationFetcher implements Fetcher<ResultSet, GeoQueryConfig> {

    private final QueryProvider queryProvider;
    private final ModelProvider modelProvider;

    public LocationInformationFetcher(QueryProvider queryProvider, ModelProvider modelProvider) {
        this.queryProvider = queryProvider;
        this.modelProvider = modelProvider;
    }

    @Override
    public ResultSet fetch (GeoQueryConfig config) {

        var model = modelProvider.getModel(config.area());
        var query = queryProvider.getQuery(config.query());

        return QueryExecutionFactory.create(query, model).execSelect();
    }
}
