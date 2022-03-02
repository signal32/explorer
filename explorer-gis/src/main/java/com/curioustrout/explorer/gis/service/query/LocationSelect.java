package com.curioustrout.explorer.gis.service.query;

import com.curioustrout.explorer.core.query.SparqlQuery;
import com.curioustrout.explorer.core.geo.GeoPosition;
import com.curioustrout.explorer.gis.util.QueryConfig;

@SparqlQuery(fileName = "radius_from_center.sparql")
public record LocationSelect(
        GeoPosition center,
        String radius,
        String language
) implements QueryConfig { }
