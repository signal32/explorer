/*
package com.curioustrout.explorer.gis.geo;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static java.lang.Math.*;

*/
/**
 * Simple QuadTree implementation.
 * @implNote  Does not support bottom -> top searching or dynamic re-ordering of Quads
 *
 * @param <T> type of data stored in quadtree
 *//*

public class QuadOld<T> */
/*implements Iterable<T>*//*
{

    private static final int DEFAULT_MAX_DEPTH = 25;

    private static final double RADIUS_MAJOR = 6378137.0;
    private static final double RADIUS_MINOR = 6356752.3142;

    protected static class Point {
        double x,y;

        Point(double x, double y) {
            this.x = x;
            this.y = y;
        }

        static Point fromPosition(GeoPosition p) {
            return new Point(
                    toRadians(p.lng * RADIUS_MINOR),
                    log(tan(PI / 4 + toRadians(p.lat) / 2)) * RADIUS_MAJOR
            );
        }

        double distance(Point other) {
            var dx = x - other.x;
            var dy = y - other.y;
            return sqrt(dx * dx + dy * dy);
        }

        Point midpoint(Point other) {
            var mx = (x + other.x)/2;
            var my = (y + other.y)/2;
            return new Point(mx, my);
        }

    }

    protected static class Box {
        Point ne, sw;

        Box(Point ne, Point sw) {
            this.ne = ne;
            this.sw = sw;
        }

        static Box fromArea(Area a) {
            return new Box(
                    Point.fromPosition(a.getNe()),
                    Point.fromPosition(a.getSw())
            );
        }

        Point midPoint(){
            return sw.midpoint(ne);
        }

        double crossSection() {
            return this.ne.distance(this.sw);
        }

        boolean intersects(Box other) {
            return !(other.ne.x <= this.sw.x ||
                    other.sw.x >= this.ne.x ||
                    other.ne.y <= this.sw.y ||
                    other.sw.y >= this.ne.y );
        }

        boolean contains(Box other) {
            return (
                    other.sw.x <= this.ne.x && other.sw.x >= this.sw.x && // Bottom left horizontal
                            other.sw.y <= this.ne.y && other.sw.x >= this.sw.y && // bottom left vertical
                            other.ne.x <= this.ne.x && other.ne.x >= this.sw.x && // Top right Horizontal
                            other.ne.y <= this.ne.y && other.ne.x >= this.sw.y    // Top right Vertical
            );
        }
    }

    public enum Section {
        NE, SE, SW, NW
    }

    private QuadOld<T> parent;
    private QuadOld<T> ne;
    private QuadOld<T> se;
    private QuadOld<T> sw;
    private QuadOld<T> nw;

    private int maxDepth;
    private int depth;
    private Box box;

    private T value;


    protected QuadOld(T value, QuadOld<T> parent, QuadOld<T> ne, QuadOld<T> se, QuadOld<T> sw, QuadOld<T> nw, int maxDepth, int depth, Box box) {
        this.parent = parent;
        this.ne = ne;
        this.se = se;
        this.sw = sw;
        this.nw = nw;
        this.maxDepth = maxDepth;
        this.depth = depth;
        this.box = box;
        this.value = value;
    }

    protected QuadOld(T value, Box box, int maxDepth) {
        this.value = value;
        this.box = box;
        this.maxDepth = maxDepth;
    }

    public QuadOld(T value) {
        this(value, DEFAULT_MAX_DEPTH);
    }

    public QuadOld(T value, int maxDepth) {
        this.value = value;
        this.maxDepth = maxDepth;
        this.depth = 0;
    }

    public Box getBox() {
        return box;
    }

    public void setBox(Box area) {
        this.box = area;
    }

    public int getDepth() {
        return depth;
    }

    public T get() {
        return value;
    }

    public void set(T data) {
        this.value = data;
    }

    public QuadOld<T> find(GeoPosition position) {
        return find(Point.fromPosition(position));
    }

    */
/**
     * Find the lowest quad in Quadtree which encapsulates the given coordinate.
     * If the coordinate is outside the Quadtree bounds then the closes tile will be returned.
     *//*

    public QuadOld<T> find(Point coordinate) {
        var tile = this;
        while (tile.depth < maxDepth) {
            var child = tile.getChild(coordinate);
            if (child.isPresent()){
                tile = child.get();
            }
            else {
                return tile;
            }
        }
        return tile;
    }

    public List<QuadOld<T>> find(Area targetArea, int minDepth) {
        return find(Box.fromArea(targetArea), minDepth);
    }

    public List<QuadOld<T>> find(Area targetArea) {
        return find(Box.fromArea(targetArea), 0);
    }

    */
/**
     * Find the smallest quads that intersect with the target area.
     *//*

    public List<QuadOld<T>> find(Box targetArea, int minDepth) {
        var quadList = new ArrayList<QuadOld<T>>();

        if (depth >= minDepth && box.intersects(targetArea) && getChildrenContaining(box).isEmpty()) {
            quadList.add(this);
        }

        // Recurse over child quads
        for (var child : getChildrenContaining(targetArea)) {
            quadList.addAll(child.find(targetArea, minDepth));
        }

        return quadList;
    }

    */
/**
     * Create new quads to contain an area at given depth
     *//*

    public List<QuadOld<T>> findOrCreate(Area targetArea, int targetDepth) {
        return findOrCreate(Box.fromArea(targetArea), targetDepth);
    }

    */
/**
     * Create new quads to contain an area at given depth
     *//*

    public List<QuadOld<T>> findOrCreate(Box targetArea, int targetDepth) {
        var quadList = new ArrayList<QuadOld<T>>();

        if (box.intersects(targetArea) && depth == targetDepth) {
            return List.of(this);
        }

        // if we are in right area but children are empty
        if (box.intersects(targetArea) && getChildrenContaining(targetArea).isEmpty()) {
            initChildQuads();
        }

        for (var child : getChildrenContaining(targetArea)) {
            quadList.addAll(child.findOrCreate(targetArea, targetDepth));
        }

        return quadList;
    }

 */
/*   *//*
*/
/**
     * Insert a Quad into the tree structure.
     *//*
*/
/*
    public void insert(Quad<T> quad) {
        var destination = find(quad.box.midPoint()); // get deepest existing quad
        destination.setChild(quad);
    }*//*


    */
/**
     * Set child Quad in one of the current Quads sections.
     *//*

    public void setQuad(QuadOld<T> quad, Section section) {

        quad.parent = this;
        quad.depth = this.depth + 1;

        // Recalculate the quads' area as subsection of parents.
        switch (section) {
            case NE -> {
                quad.box = new Box(this.box.ne, this.box.midPoint());
                ne = quad;
            }
            case SE -> {
                var newSw = new Point(this.box.midPoint().x, this.box.sw.y);
                var newNe = new Point(this.box.ne.x, this.box.midPoint().y);
                quad.box = new Box(newNe, newSw);
                se = quad;
            }
            case SW -> {
                quad.box = new Box(this.box.midPoint(), this.box.sw);
                sw = quad;
            }
            case NW -> {
                var newSw = new Point(this.box.sw.x,this.box.midPoint().y);
                var newNe = new Point(this.box.midPoint().x, this.box.ne.y);
                quad.box = new Box(newNe, newSw);
                nw = quad;
            }
        }
    }

    */
/**
     * Break up Quad into 4 sub nodes. Skips existing children.
     *//*

    private void initChildQuads() {
        if (ne == null) setQuad(new QuadOld<>(null), Section.NE);
        if (se == null) setQuad(new QuadOld<>(null), Section.SE);
        if (sw == null) setQuad(new QuadOld<>(null), Section.SW);
        if (nw == null) setQuad(new QuadOld<>(null), Section.NW);
    }

    public boolean isLeaf() {
        return (ne == null && se == null && sw == null && nw == null);
    }

    */
/**
     * Get the child quad which occupies the given coordinate
     *//*

    private Optional<QuadOld<T>> getChild(Point coordinate) {
        var angle = Math.atan2(coordinate.y - this.box.midPoint().y, coordinate.x - this.box.midPoint().x); //radians

        if (angle > 0 && angle < Math.PI/2){
            return Optional.ofNullable(ne);
        }
        else if (angle > Math.PI/2 && angle < Math.PI){
            return Optional.ofNullable(se);
        }
        else if (angle > Math.PI && angle < Math.PI/2*3){
            return Optional.ofNullable(sw);
        }
        else return Optional.ofNullable(nw);
    }

    private List<QuadOld<T>> getChildrenContaining(Box targetArea) {
        var quadList = new ArrayList<QuadOld<T>>();
        if (ne != null && targetArea.intersects(ne.box)) quadList.add(ne);
        if (se != null && targetArea.intersects(se.box)) quadList.add(se);
        if (sw != null && targetArea.intersects(sw.box)) quadList.add(sw);
        if (nw != null && targetArea.intersects(nw.box)) quadList.add(nw);
        return quadList;
    }

    */
/**
     * Sets new child quad into correct quadrant.
     *//*

    private void setChild(QuadOld<T> quad) {
        var angle = Math.atan2(quad.box.midPoint().y - this.box.midPoint().y, quad.box.midPoint().x - this.box.midPoint().x); //radians
        quad.maxDepth = this.maxDepth - 1;
        quad.depth = this.depth + 1;

        if (angle > 0 && angle < Math.PI/2){
            ne = quad;
        }
        else if (angle > Math.PI/2 && angle < Math.PI){
            se = quad;
        }
        else if (angle > Math.PI && angle < Math.PI/2*3){
            sw = quad;
        }
        else nw = quad;

    }

    public QuadOld<T> getChild(Section section){
        return switch (section) {
            case NE -> ne;
            case NW -> nw;
            case SE -> se;
            case SW -> sw;
        };
    }

    public static <T> QuadOld<T> createRoot(T value, Area area, int maxDepth) {
        return new QuadOld<>(value, Box.fromArea(area), maxDepth);
    }

}
*/
