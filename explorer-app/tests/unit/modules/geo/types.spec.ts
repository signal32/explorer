import {LatLng, LatLngBounds} from '@/modules/geo/types';

const NE = new LatLng(10,10);
const SW = new LatLng(-10, -10);
const N = new LatLng(10, 0);
const S = new LatLng(-10, 0);
const E = new LatLng(0, 10);
const W = new LatLng(0, -10);
const EQUATOR = new LatLng(0, 0);
const LONDON = new LatLng(51.4683697, -0.1771297);
const NEW_YORK = new LatLng(40.6974881, -73.979681);

const FAR_AWAY = new LatLngBounds(new LatLng(55,55), new LatLng( 50, 50));
const WORLD  = new LatLngBounds(new LatLng(89,179),new LatLng(-89,-179));
const GEO_BOX1 = new LatLngBounds(new LatLng(10,10), new LatLng( 5, 5));
const GEO_BOX2 = new LatLngBounds(new LatLng(6,6), new LatLng( 0, 0)); //intersects with box 1
const GEO_BOX3 = new LatLngBounds(new LatLng(20,20), new LatLng( 5, 10)); //alongside box1

describe('Geo Types', () => {

    it('Distance tests', () => {
        expect(NE.distance(SW)).toBeCloseTo(3137041, 0.001);
        expect(N.distance(S)).toBeCloseTo(2223899, 0.001);
        expect(E.distance(W)).toBeCloseTo(2223899, 0.001);
        expect(LONDON.distance(NEW_YORK)).toBeCloseTo(5567679, 0.001);
    })

    it('Midpoint tests', () => {
        midpointTester(NE, SW, EQUATOR);
        midpointTester(N, S, EQUATOR);
        midpointTester(E, W, EQUATOR);
        midpointTester(N, SW, new LatLng(0,-5)); //https://www.geomidpoint.com/
        midpointTester(LONDON, NEW_YORK, new LatLng(52.329072,-41.282765));
    })

    it('Intersect tests', () => {
        expect(GEO_BOX1.intersects(WORLD)).toBe(true);
        expect(GEO_BOX1.intersects(GEO_BOX2)).toBe(true);
        expect(GEO_BOX1.intersects(GEO_BOX3)).toBe(false);
        expect(GEO_BOX1.intersects(FAR_AWAY)).toBe(false);
    })

    it('Touches tests', () => {
        expect(GEO_BOX1.intersects(WORLD)).toBe(true);
        expect(GEO_BOX1.touches(GEO_BOX2)).toBe(true);
        expect(GEO_BOX1.touches(GEO_BOX3)).toBe(true);
        expect(GEO_BOX1.intersects(FAR_AWAY)).toBe(false);
    })

    it('Contains tests', () => {
        expect(WORLD.contains(GEO_BOX1)).toBe(true);
        expect(GEO_BOX1.contains(WORLD)).toBe(false)
    })

})


function midpointTester(p1: LatLng, p2: LatLng, realMid: LatLng) {
    let mid = p1.midpoint(p2);
    expect(mid.lat).toBeCloseTo(realMid.lat, 0.001);
    expect(mid.lng).toBeCloseTo(realMid.lng, 0.001);
}