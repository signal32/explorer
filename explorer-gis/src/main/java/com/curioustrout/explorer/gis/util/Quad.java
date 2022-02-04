package com.curioustrout.explorer.gis.util;

import org.locationtech.jts.geom.Coordinate;

import java.util.Optional;

/**
 * Simple QuadTree implementation.
 * @implNote  Does not support bottom -> top searching or dynamic re-ordering of Quads
 *
 * @param <S> Abstract size of quad
 * @param <D> Abstract data associated with quad
 */
public class Quad<S extends Comparable<S>, D>{

    private static final int DEFAULT_MAX_DEPTH = 25;

    private Quad<S, D> parent;
    private Quad<S, D> ne;
    private Quad<S, D> se;
    private Quad<S, D> sw;
    private Quad<S, D> nw;

    private int maxDepth;
    private final Coordinate coordinate; // x lng, y lat, z zoom
    private S size;
    private D data;


    /**
     * Create a new Quad node with parent and children quads
     * @param parent Non nullable parent
     * @param ne North-east quad
     * @param se South-east quad
     * @param sw South-west quad
     * @param nw North-west quad
     */
    public Quad(Quad<S, D> parent, Quad<S, D> ne, Quad<S, D> se, Quad<S, D> sw, Quad<S, D> nw, Coordinate coordinate) {
        this.parent = parent;
        this.ne = ne;
        this.se = se;
        this.sw = sw;
        this.nw = nw;

        this.coordinate = coordinate;
        this.maxDepth = parent.maxDepth - 1;
    }

    /**
     * Create a new root Quad node with no parent and children quads
     * @param ne North-east quad
     * @param se South-east quad
     * @param sw South-west quad
     * @param nw North-west quad
     */
    public Quad(Quad<S, D> ne, Quad<S, D> se, Quad<S, D> sw, Quad<S, D> nw, int maxDepth) {
        this.ne = ne;
        this.se = se;
        this.sw = sw;
        this.nw = nw;
        this.maxDepth = maxDepth;
        this.coordinate = new Coordinate(0,0, 0);
    }

    /**
     * Create new leaf Quad node with parent only and no children
     * @param parent Parent node
     */
    public Quad(Quad<S, D> parent, Coordinate coordinate) {
        this(parent, null, null, null, null, coordinate);
    }

    /**
     * Create new root Quad.
     * @param maxDepth The maximum premised depth of this tree
     */
    public Quad(int maxDepth){
        this(null, null, null, null, maxDepth);
    }


    public S getSize() {
        return size;
    }

    public void setSize(S size) {
        this.size = size;
    }

    public D getData() {
        return data;
    }

    public void setData(D data) {
        this.data = data;
    }

    /**
     * Find the lowest quad in Quadtree which encapsulates the given coordinate.
     * If the coordinate is outside the Quadtree bounds then the closes tile will be returned.
     */
    public Quad<S, D> find(Coordinate coordinate) {
        var tile = this;
        while (tile.coordinate.z < maxDepth) {
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

    public void insert(Quad<S, D> quad) {
        var destination = find(quad.coordinate); // get deepest existing quad
        destination.setChild(quad);
    }

    /**
     * Get the child quad which occupies the given coordinate
     */
    private Optional<Quad<S, D>> getChild(Coordinate coordinate) {
        var angle = Math.atan2(coordinate.y - this.coordinate.y, coordinate.x - this.coordinate.y); //radians

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

    /**
     * Sets new child quad into correct quadrant.
     */
    private void setChild(Quad<S, D> quad) {
        var angle = Math.atan2(quad.coordinate.y - this.coordinate.y, quad.coordinate.x - this.coordinate.y); //radians
        quad.maxDepth = this.maxDepth - 1;
        quad.coordinate.z = this.coordinate.z + 1;

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

}
