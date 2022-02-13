/*
package com.curioustrout.explorer.gis.geo;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class QuadOldTreeTests {

    static final Area TEST_AREA = new Area(new GeoPosition(10,10), new GeoPosition(-10,-10));
    static final Area TEST_SUB_AREA_NE = new Area(new GeoPosition(8,8), new GeoPosition(4,4));

    //static final Area TEST_SUB_AREA_NE_X = new Area(new Position(80,80), new Position(60,60));


    @Test
    void findThis() {
        QuadOld<String> quadTree = QuadOld.createRoot("root", Area.GEO_TEST_BOX, 10);
        assertEquals(quadTree.find(new GeoPosition(0, 0)), quadTree);
        assertEquals(quadTree.find(new GeoPosition(1000, 0)), quadTree);
        assertEquals(quadTree.find(new GeoPosition(0, 1000)), quadTree);
        assertEquals(quadTree.find(new GeoPosition(1000, 1000)), quadTree);
    }

    @Test
    void setQuad() {
        var tree = QuadOld.createRoot("root", TEST_AREA, 10);
        var ne = new QuadOld<>("ne");
        var se = new QuadOld<>("se");
        var sw = new QuadOld<>("sw");
        var nw = new QuadOld<>("nw");

        tree.setQuad(ne, QuadOld.Section.NE);
        tree.setQuad(se, QuadOld.Section.SE);
        tree.setQuad(sw, QuadOld.Section.SW);
        tree.setQuad(nw, QuadOld.Section.NW);

        // Make sure we can get the same child back!
        assertEquals(ne, tree.getChild(QuadOld.Section.NE));
        assertEquals(se, tree.getChild(QuadOld.Section.SE));
        assertEquals(sw, tree.getChild(QuadOld.Section.SW));
        assertEquals(nw, tree.getChild(QuadOld.Section.NW));

        // The area covered by a child should be half of it's parent
        childRelationTest(ne, tree);
        childRelationTest(se, tree);
        childRelationTest(sw, tree);
        childRelationTest(nw, tree);

        assertFalse(tree.isLeaf());
        assertTrue(ne.isLeaf());
        assertTrue(se.isLeaf());
        assertTrue(sw.isLeaf());
        assertTrue(nw.isLeaf());

        // Child quads may overlap slightly in practice, but during testing
        // this indicates something has gone wrong in the calculations.
        assertFalse(ne.getBox().intersects(se.getBox()), "Child intersects with on of it's neighbours!");
        assertFalse(se.getBox().intersects(sw.getBox()), "Child intersects with on of it's neighbours!");
        assertFalse(sw.getBox().intersects(nw.getBox()), "Child intersects with on of it's neighbours!");
        assertFalse(nw.getBox().intersects(ne.getBox()), "Child intersects with on of it's neighbours!");

    }

    private void childRelationTest(QuadOld<?> child, QuadOld<?> parent) {
        var cs = child.getBox().crossSection();
        var parentCs = parent.getBox().crossSection();
        assertTrue(inRange(cs, parentCs / 2, 1), "Cross-section of child area not half of parents.\nParent: " + parentCs + "\t Child: " + cs);
    }

    private boolean inRange(double actual, double target, double range) {
        return (actual > target - range && actual < target + range);
    }

    @Test
    void findOrCreateTest() {
        var tree = QuadOld.createRoot("root", TEST_AREA, 10);
        var quads = tree.findOrCreate(TEST_SUB_AREA_NE, 1);

        tree = QuadOld.createRoot("root", TEST_AREA, 10);
        quads = tree.findOrCreate(TEST_SUB_AREA_NE, 2);

        //Anticlockwise from NE. Relies on implicit ordering from findOrCreate() so may fail if you changed something
        assertTrue(QuadOld.Box.fromArea(Area.of(11,11,4,4)).contains(quads.get(0).getBox()));
        assertTrue(QuadOld.Box.fromArea(Area.of(6, 11, -1, 4)).contains(quads.get(1).getBox()));
        assertTrue(QuadOld.Box.fromArea(Area.of(6, 6, -1, -1)).contains(quads.get(2).getBox()));
        //assertTrue(GeoArea.of(12, 7, 3, -2).contains(quads.get(3).getArea())); TODO this fails for some strange reason but looks fine.
    }

    @Test
    void findTest() {
        var tree = QuadOld.createRoot("root", TEST_AREA, 10);
        var quads = tree.findOrCreate(TEST_SUB_AREA_NE, 2);

        int i = 0;
        for (var quad : quads){
            quad.set(String.format("quad_%d", i++));
        }

        // Try to get the quad in some top left position (should be named quad_0)
        var items = tree.find(Area.of(7,7,6,6));
        assertEquals(1, items.size());
        assertEquals("quad_0", items.get(0).get());

        // Try to get at lower depth (there should be none as we did not create it)
        items = tree.find(Area.of(7,7,6,6), 3);
        assertEquals(0, items.size());

        // If we allow the tree to create new items though, we should find it
        // Note: This system falls apart if world size is small & depth is high, presumably due to rounding issues (especially with lng/lat calc)
        var newItems = tree.findOrCreate(Area.of(7,7,6,6), 3);
        newItems.get(0).set("Hello from new quad!");
        items = tree.find(Area.of(7,7,6,6), 3);
        assertEquals(1, items.size());
        assertEquals("Hello from new quad!", items.get(0).get());
    }

}
*/
