package com.curioustrout.explorer.gis.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class PositionTest {

    static Position NE = new Position(10, 10);
    static Position SW = new Position(-10, -10);
    static Position N = new Position(10, 0);
    static Position S = new Position(-10, 0);
    static Position E = new Position(0, 10);
    static Position W = new Position(0, -10);
    static Position EQUATOR = new Position(0, 0);
    static Position LONDON = new Position(51.4683697, -0.1771297);
    static Position NEW_YORK = new Position(40.6974881, -73.979681);

    @Test
    void distanceTest() {
        //Real distance (in meters) taken from https://latlongdata.com/distance-calculator/
        distanceTester(NE, SW, 3137041);
        distanceTester(N, S, 2223899);
        distanceTester(E, W, 2223899);
        distanceTester(LONDON, NEW_YORK, 5567679);
    }

    private void distanceTester(Position p1, Position p2, double realDistance) {
        var distance = p1.distance(p2);
        assertTrue(distance <= realDistance + 1 && distance >= realDistance -1, "Distance " + distance + " out by +/- 1m from " + realDistance);
    }

    @Test
    void midpointTest() {
        Position.midpoint(NE,SW);
        var mid1 = NE.midpoint(SW);
        midpointTester(NE, SW, EQUATOR);
        midpointTester(N, S, EQUATOR);
        midpointTester(E, W, EQUATOR);
        midpointTester(N, SW, new Position(0,-5)); //https://www.geomidpoint.com/
        midpointTester(LONDON, NEW_YORK, new Position(52.329072,-41.282765));
    }

    private void midpointTester(Position p1, Position p2, Position realMid) {
        var mid = p1.midpoint(p2);
        assertTrue(mid.lng <= realMid.lng + 1 && mid.lng >= realMid.lng -1, "Midpoint lng out of tolerance by +/- 1m. Got " + mid + " Expected " + realMid);
        assertTrue(mid.lat <= realMid.lat + 1 && mid.lat >= realMid.lat -1, "Midpoint lat out of tolerance by +/- 1m. Got " + mid + " Expected " + realMid);
        assertTrue(mid.alt <= realMid.alt + 1 && mid.alt >= realMid.alt -1, "Midpoint alt out of tolerance by +/- 1m. Got " + mid + " Expected " + realMid);
    }

}