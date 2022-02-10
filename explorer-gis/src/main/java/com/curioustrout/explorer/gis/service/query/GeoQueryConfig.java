package com.curioustrout.explorer.gis.service.query;

import com.curioustrout.explorer.gis.util.GeoArea;

public record GeoQueryConfig (
        GeoArea area,
        int detailLevel
) { }
