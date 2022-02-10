package com.curioustrout.explorer.gis.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GeoAreaTest {

    static GeoArea FAR_AWAY = new GeoArea(new Position(55,55), new Position( 50, 50));
    static GeoArea WORLD  = GeoArea.WORLD;
    static GeoArea BOX1 = new GeoArea(new Position(10,10), new Position( 5, 5));
    static GeoArea BOX2 = new GeoArea(new Position(6,6), new Position( 0, 0)); //intersects with box 1
    static GeoArea BOX3 = new GeoArea(new Position(20,20), new Position( 5, 10)); //alongside box1


    @Test
    void intersectsTest(){
        assertTrue(BOX1.intersects(WORLD));
        assertTrue(BOX1.intersects(BOX2));
        assertFalse(BOX1.intersects(BOX3));
        assertFalse(BOX1.intersects(FAR_AWAY));
    }

    @Test
    void touchesTest(){
        assertTrue(BOX1.intersects(WORLD));
        assertTrue(BOX1.touches(BOX2));
        assertTrue(BOX1.touches(BOX3));
        assertFalse(BOX1.intersects(FAR_AWAY));
    }

    @Test
    void containsTest(){
        assertTrue(WORLD.contains(BOX1));
        assertFalse(BOX1.contains(WORLD));
    }




}