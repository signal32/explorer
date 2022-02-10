package com.curioustrout.explorer.gis.service.query;

import com.curioustrout.explorer.gis.util.QueryConfig;
import org.locationtech.jts.geom.Coordinate;

@SparqlQuery(fileName = "radius_from_center_describe.sparql")
public record LocationQuery(
        Coordinate center,
        String radius,
        String language
) implements QueryConfig {}