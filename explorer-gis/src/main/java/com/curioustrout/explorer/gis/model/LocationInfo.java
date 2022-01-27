package com.curioustrout.explorer.gis.model;

import org.locationtech.jts.geom.Coordinate;

public interface LocationInfo {

    String getName();
    String getId();
    Coordinate getCoordinate();
}
