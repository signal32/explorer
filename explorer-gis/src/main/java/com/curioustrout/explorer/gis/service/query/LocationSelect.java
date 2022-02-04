package com.curioustrout.explorer.gis.service.query;

import org.locationtech.jts.geom.Coordinate;

@SparqlQuery(fileName = "radius_from_center.sparql")
public record LocationSelect(
        Coordinate center,
        String radius,
        String language
) { }
