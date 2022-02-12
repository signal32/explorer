package com.curioustrout.explorer.gis.service.query;

import com.curioustrout.explorer.gis.geo.Area;
import com.curioustrout.explorer.gis.util.QueryConfig;

public record GeoQueryConfig (
        QueryConfig query,
        Area area,
        int detailLevel
) { }
