package com.curioustrout.explorer.gis.geo;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GeoPositionTest {

    static GeoPosition NE = new GeoPosition(10, 10);
    static GeoPosition SW = new GeoPosition(-10, -10);
    static GeoPosition N = new GeoPosition(10, 0);
    static GeoPosition S = new GeoPosition(-10, 0);
    static GeoPosition E = new GeoPosition(0, 10);
    static GeoPosition W = new GeoPosition(0, -10);
    static GeoPosition EQUATOR = new GeoPosition(0, 0);
    static GeoPosition LONDON = new GeoPosition(51.4683697, -0.1771297);
    static GeoPosition NEW_YORK = new GeoPosition(40.6974881, -73.979681);

    @Test
    void distanceTest() {
        //Real distance (in meters) taken from https://latlongdata.com/distance-calculator/
        distanceTester(NE, SW, 3137041);
        distanceTester(N, S, 2223899);
        distanceTester(E, W, 2223899);
        distanceTester(LONDON, NEW_YORK, 5567679);
    }

    private void distanceTester(GeoPosition p1, GeoPosition p2, double realDistance) {
        var distance = p1.distance(p2);
        assertTrue(distance <= realDistance + 1 && distance >= realDistance -1, "Distance " + distance + " out by +/- 1m from " + realDistance);
    }

    @Test
    void midpointTest() {
        GeoPosition.midpoint(NE,SW);
        var mid1 = NE.midpoint(SW);
        midpointTester(NE, SW, EQUATOR);
        midpointTester(N, S, EQUATOR);
        midpointTester(E, W, EQUATOR);
        midpointTester(N, SW, new GeoPosition(0,-5)); //https://www.geomidpoint.com/
        midpointTester(LONDON, NEW_YORK, new GeoPosition(52.329072,-41.282765));
        //midpointTester(new GeoPosition(-90, -140), new GeoPosition(90, 140), new GeoPosition(0,0));
    }

    private void midpointTester(GeoPosition p1, GeoPosition p2, GeoPosition realMid) {
        var mid = p1.midpoint(p2);
        assertTrue(mid.lng <= realMid.lng + 1 && mid.lng >= realMid.lng -1, "Midpoint lng out of tolerance by +/- 1m. Got " + mid + " Expected " + realMid);
        assertTrue(mid.lat <= realMid.lat + 1 && mid.lat >= realMid.lat -1, "Midpoint lat out of tolerance by +/- 1m. Got " + mid + " Expected " + realMid);
        assertTrue(mid.alt <= realMid.alt + 1 && mid.alt >= realMid.alt -1, "Midpoint alt out of tolerance by +/- 1m. Got " + mid + " Expected " + realMid);
    }

    @Test
    void projectTest() {
        assertEquals(new GeoPosition(44, 22).project(), new Position(2449028.7974520186, 5465442.183322753));
        assertEquals(new GeoPosition(44, 22).projectPrecise(), new Position(2449028.7974520186, 5435749.887511954));
    }

}