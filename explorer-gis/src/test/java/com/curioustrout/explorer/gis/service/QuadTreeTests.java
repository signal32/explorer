package com.curioustrout.explorer.gis.service;

import com.curioustrout.explorer.gis.util.GeoArea;
import com.curioustrout.explorer.gis.util.Quad;
import org.junit.jupiter.api.Test;
import org.locationtech.jts.geom.Coordinate;

import static org.junit.jupiter.api.Assertions.assertEquals;

class QuadTreeTests {

    Quad<GeoArea, Boolean> quadTree = new Quad<>(5);

    @Test
    void findThis() {
        assertEquals(quadTree.find(new Coordinate(0, 0)), quadTree);
        assertEquals(quadTree.find(new Coordinate(1000, 0)), quadTree);
        assertEquals(quadTree.find(new Coordinate(0, 1000)), quadTree);
        assertEquals(quadTree.find(new Coordinate(1000, 1000)), quadTree);
    }

    @Test
    void addNew() {
        var childQuad = new Quad<>(quadTree, new Coordinate(10, 10));
        quadTree.insert(childQuad);

        assertEquals(quadTree.find(new Coordinate(10, 10)), childQuad);
    }
}
