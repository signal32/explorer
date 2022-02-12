package com.curioustrout.explorer.gis.geo;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Simple QuadTree implementation.
 * @implNote  Does not support bottom -> top searching or dynamic re-ordering of Quads
 *
 * @param <T> type of data stored in quadtree
 */
public class Quad<T> /*implements Iterable<T>*/{

    private static final int DEFAULT_MAX_DEPTH = 25;

    public enum Section {
        NE, SE, SW, NW
    }

    private Quad<T> parent;
    private Quad<T> ne;
    private Quad<T> se;
    private Quad<T> sw;
    private Quad<T> nw;

    private int maxDepth;
    private int depth;
    private Area area;

    private T value;


    protected Quad(T value, Quad<T> parent, Quad<T> ne, Quad<T> se, Quad<T> sw, Quad<T> nw, int maxDepth, int depth, Area area) {
        this.parent = parent;
        this.ne = ne;
        this.se = se;
        this.sw = sw;
        this.nw = nw;
        this.maxDepth = maxDepth;
        this.depth = depth;
        this.area = area;
        this.value = value;
    }

    protected Quad(T value, Area area, int maxDepth) {
        this.value = value;
        this.area = area;
        this.maxDepth = maxDepth;
        //todo divide area
    }

    public Quad(T value) {
        this(value, DEFAULT_MAX_DEPTH);
    }

    public Quad(T value, int maxDepth) {
        this.value = value;
        this.maxDepth = maxDepth;
        this.depth = 0;
    }

    public Area getArea() {
        return area;
    }

    public void setArea(Area area) {
        this.area = area;
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

    /**
     * Find the lowest quad in Quadtree which encapsulates the given coordinate.
     * If the coordinate is outside the Quadtree bounds then the closes tile will be returned.
     */
    public Quad<T> find(Position coordinate) {
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

    /**
     * Find the smallest quads that intersect with the target area.
     */
    public List<Quad<T>> find(Area targetArea, int minDepth) {
        var quadList = new ArrayList<Quad<T>>();

        if (depth >= minDepth && area.intersects(targetArea) && getChildrenContaining(area).isEmpty()) {
            quadList.add(this);
        }

        // Recurse over child quads
        for (var child : getChildrenContaining(targetArea)) {
            quadList.addAll(child.find(targetArea, minDepth));
        }

        return quadList;
    }

    public List<Quad<T>> find(Area targetArea) {
        return find(targetArea, 0);
    }

    /**
     * Create new quads to contain an area at given depth
     */
    public List<Quad<T>> findOrCreate(Area targetArea, int targetDepth) {
        var quadList = new ArrayList<Quad<T>>();

        if (area.intersects(targetArea) && depth == targetDepth) {
            return List.of(this);
        }

        // if we are in right area but children are empty
        if (area.intersects(targetArea) && getChildrenContaining(targetArea).isEmpty()) {
            initChildQuads();
        }

        for (var child : getChildrenContaining(targetArea)) {
            quadList.addAll(child.findOrCreate(targetArea, targetDepth));
        }

        return quadList;
    }

    /**
     * Insert a Quad into the tree structure.
     */
    public void insert(Quad<T> quad) {
        var destination = find(quad.area.midPoint()); // get deepest existing quad
        destination.setChild(quad);
    }

    /**
     * Set child Quad in one of the current Quads sections.
     */
    public void setQuad(Quad<T> quad, Section section) {

        quad.parent = this;
        quad.depth = this.depth + 1;

        // Recalculate the quads' area as subsection of parents.
        switch (section) {
            case NE -> {
                quad.area = new Area(this.area.getNe(), this.area.midPoint());
                ne = quad;
            }
            case SE -> {
                //var sePos = this.area.se();
                //var newNe = this.area.getNe().midpoint(sePos);
                var newSw = new Position(this.area.midPoint().x, this.area.getSw().y);//this.area.getSw().midpoint(sePos);
                var newNe = new Position(this.area.getNe().x, this.area.midPoint().y);
                quad.area = new Area(newNe, newSw);
                se = quad;
            }
            case SW -> {
                quad.area = new Area(this.area.midPoint(), this.area.getSw());
                sw = quad;
            }
            case NW -> {
/*                var nwPos = this.area.nw();
                var newNe = new Position(this.area.getNe().x, this.area.midPoint().y);//this.area.getNe().midpoint(nwPos);
                var newSw = this.area.getSw().midpoint(nwPos);*/
                var newSw = new Position(this.area.getSw().x,this.area.midPoint().y);
                var newNe = new Position(this.area.midPoint().x, this.area.getNe().y);

                quad.area = new Area(newNe, newSw);
                nw = quad;
            }
        }
    }

    /**
     * Break up Quad into 4 sub nodes. Skips existing children.
     */
    private void initChildQuads() {
        if (ne == null) setQuad(new Quad<T>(null), Section.NE);
        if (se == null) setQuad(new Quad<T>(null), Section.SE);
        if (sw == null) setQuad(new Quad<T>(null), Section.SW);
        if (nw == null) setQuad(new Quad<T>(null), Section.NW);
    }

    public boolean isLeaf() {
        return (ne == null && se == null && sw == null && nw == null);
    }

    /**
     * Get the child quad which occupies the given coordinate
     */
    private Optional<Quad<T>> getChild(Position coordinate) {
        var angle = Math.atan2(coordinate.y - this.area.midPoint().y, coordinate.x - this.area.midPoint().x); //radians

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

    private List<Quad<T>> getChildrenContaining(Area targetArea) {
        var quadList = new ArrayList<Quad<T>>();
        if (ne != null && targetArea.intersects(ne.area)) quadList.add(ne);
        if (se != null && targetArea.intersects(se.area)) quadList.add(se);
        if (sw != null && targetArea.intersects(sw.area)) quadList.add(sw);
        if (nw != null && targetArea.intersects(nw.area)) quadList.add(nw);
        return quadList;
    }

    /**
     * Sets new child quad into correct quadrant.
     */
    private void setChild(Quad<T> quad) {
        var angle = Math.atan2(quad.area.midPoint().y - this.area.midPoint().y, quad.area.midPoint().x - this.area.midPoint().x); //radians
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

    public Quad<T> getChild(Section section){
        return switch (section) {
            case NE -> ne;
            case NW -> nw;
            case SE -> se;
            case SW -> sw;
        };
    }

    public static <T> Quad<T> createRoot(T value, Area area, int maxDepth) {
        return new Quad<>(value, area, maxDepth);
    }

}
