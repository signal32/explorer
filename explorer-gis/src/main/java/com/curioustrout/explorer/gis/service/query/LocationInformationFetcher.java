package com.curioustrout.explorer.gis.service.query;

import com.curioustrout.explorer.core.query.types.Point;
import com.curioustrout.explorer.gis.service.ModelProvider;
import com.curioustrout.explorer.gis.service.QueryProvider;
import com.curioustrout.explorer.gis.util.Fetcher;
import org.apache.jena.datatypes.TypeMapper;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.sys.JenaSystem;
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
        System.out.println(query.toString());
        var ds = DatasetFactory.create(model);
        return RDFConnection.connect(ds).query(query).execSelect();
        //return QueryExecutionFactory.create(query, model).execSelect();
    }

    public static void main(String[] args) {
        JenaSystem.init();
        TypeMapper.getInstance().registerDatatype(Point.INSTANCE);



    }
}
