import {Quad, Side} from '@/modules/geo/quadtree';
import {LatLng, LatLngBounds, LatLngBoundsLike} from '@/modules/geo/types';

const TEST_AREA: LatLngBoundsLike = {
    ne: {lat: 10, lng: 10},
    sw: {lat: -10, lng: -10},
}

describe('QuadTree', () => {
    it('set quads', () => {
        let tree = new Quad("root");
        let ne = new Quad("ne");
        let se = new Quad("se");
        let sw = new Quad("sw");
        let nw = new Quad("nw");

        tree.setQuad(ne, Side.NE);
        tree.setQuad(se, Side.SE);
        tree.setQuad(sw, Side.SW);
        tree.setQuad(nw, Side.NW);

        expect(tree.getQuad(Side.NE)).toBe(ne);
        expect(tree.getQuad(Side.SE)).toBe(se);
        expect(tree.getQuad(Side.SW)).toBe(sw);
        expect(tree.getQuad(Side.NW)).toBe(nw);

        childRelationTest(ne, tree);
        childRelationTest(se, tree);
        childRelationTest(sw, tree);
        childRelationTest(nw, tree);

        expect(tree.isLeaf()).toBe(false);
        expect(ne.isLeaf()).toBe(true);
        expect(se.isLeaf()).toBe(true);
        expect(sw.isLeaf()).toBe(true);
        expect(nw.isLeaf()).toBe(true);

        expect(ne.asArea().intersects(se.asArea())).toBe(false);
        expect(se.asArea().intersects(sw.asArea())).toBe(false);
        expect(sw.asArea().intersects(nw.asArea())).toBe(false);
        expect(nw.asArea().intersects(ne.asArea())).toBe(false);


        expect(1+1).toBe(2);
    });

    it('find or create', () => {
        let tree = new Quad('root');
        let quads = tree.findOrCreate(TEST_AREA, 1);
        expect(quads.length).toBe(4);

        tree = new Quad('root');
        quads = tree.findOrCreate(TEST_AREA, 2);
        expect(quads.length).toBe(4);
        expect(new LatLngBounds(new LatLng(46, 91), new LatLng(-1,-1)).contains(quads[0].asArea())).toBe(true);
        expect(new LatLngBounds(new LatLng(1, 91), new LatLng(-46,-1)).contains(quads[1].asArea())).toBe(true);

    })
});

function childRelationTest(child: Quad<any>, parent: Quad<any>) {
    let cs = child.asArea().crossSection();
    let csParent = parent.asArea().crossSection() / 2;
    //console.log(`Child: ${cs} \tParent/2: ${csParent}`)
    expect(cs).toBeLessThan(csParent + 1);
    expect(cs).toBeGreaterThan(csParent - 1);
}
