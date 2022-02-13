package com.curioustrout.explorer.gis.geo;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AreaTest {

    static Area FAR_AWAY = new Area(new GeoPosition(55,55), new GeoPosition( 50, 50));
    static Area WORLD  = Area.GEO_WORLD;
    static Area GEO_BOX1 = new Area(new GeoPosition(10,10), new GeoPosition( 5, 5));
    static Area GEO_BOX2 = new Area(new GeoPosition(6,6), new GeoPosition( 0, 0)); //intersects with box 1
    static Area GEO_BOX3 = new Area(new GeoPosition(20,20), new GeoPosition( 5, 10)); //alongside box1


    @Test
    void intersectsTest(){
        // geo boxes
        assertTrue(GEO_BOX1.intersects(WORLD));
        assertTrue(GEO_BOX1.intersects(GEO_BOX2));
        assertFalse(GEO_BOX1.intersects(GEO_BOX3));
        assertFalse(GEO_BOX1.intersects(FAR_AWAY));

    }

    @Test
    void touchesTest(){
        assertTrue(GEO_BOX1.intersects(WORLD));
        assertTrue(GEO_BOX1.touches(GEO_BOX2));
        assertTrue(GEO_BOX1.touches(GEO_BOX3));
        assertFalse(GEO_BOX1.intersects(FAR_AWAY));

    }

    @Test
    void containsTest(){
        assertTrue(WORLD.contains(GEO_BOX1));
        assertFalse(GEO_BOX1.contains(WORLD));
    }

}