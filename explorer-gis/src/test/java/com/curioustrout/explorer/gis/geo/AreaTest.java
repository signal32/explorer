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

    static Area BOX1 = new Area(new Position(10,10), new Position( 5, 5));
    static Area BOX2 = new Area(new Position(6,6), new Position( 0, 0)); //intersects with box 1
    static Area BOX3 = new Area(new Position(20,20), new Position( 5, 10)); //alongside box1


    @Test
    void intersectsTest(){
        // geo boxes
        assertTrue(GEO_BOX1.intersects(WORLD));
        assertTrue(GEO_BOX1.intersects(GEO_BOX2));
        assertFalse(GEO_BOX1.intersects(GEO_BOX3));
        assertFalse(GEO_BOX1.intersects(FAR_AWAY));

        //normal
        assertTrue(BOX1.intersects(WORLD));
        assertTrue(BOX1.intersects(BOX2));
        assertFalse(BOX1.intersects(BOX3));
        assertFalse(BOX1.intersects(FAR_AWAY));

        assertTrue(new Area(new Position(80,80), new Position(60,60)).intersects(new Area(new Position(100, 1000), new Position(0, 0))));

    }

    @Test
    void touchesTest(){
        assertTrue(GEO_BOX1.intersects(WORLD));
        assertTrue(GEO_BOX1.touches(GEO_BOX2));
        assertTrue(GEO_BOX1.touches(GEO_BOX3));
        assertFalse(GEO_BOX1.intersects(FAR_AWAY));

        assertTrue(BOX1.intersects(WORLD));
        assertTrue(BOX1.touches(BOX2));
        assertTrue(BOX1.touches(BOX3));
        assertFalse(BOX1.intersects(FAR_AWAY));
    }

    @Test
    void containsTest(){
        assertTrue(WORLD.contains(GEO_BOX1));
        assertFalse(GEO_BOX1.contains(WORLD));

        assertTrue(WORLD.contains(BOX1));
        assertFalse(BOX1.contains(WORLD));
    }

}