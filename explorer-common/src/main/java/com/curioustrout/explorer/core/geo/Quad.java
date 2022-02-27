package com.curioustrout.explorer.core.geo;

import java.util.*;

public class Quad<T> {

    public enum Section {
        NE, SE, SW, NW
    }

    private T value;
    private Quad<T> parent;
    private GeoPosition position;
    private double width;
    private double height;
    private int depth;

    private final Map<Section, Quad<T>> children = new EnumMap<>(Section.class);

    public Quad(T value, Quad<T> parent, GeoPosition position, double width, double height, int depth) {
        this.value = value;
        this.parent = parent;
        this.position = position;
        this.width = width;
        this.height = height;
        this.depth = depth;
    }

    public Quad(T value) {
        this.value = value;
    }

    public T get() {
        return value;
    }

    public void set(T value) {
        this.value = value;
    }

    public int getDepth() {
        return depth;
    }

    public List<Quad<T>> find(Area area, int minDepth) {
        var quads = new ArrayList<Quad<T>>();

        if (depth >= minDepth && withinArea(area) && getChildrenWithin(area).isEmpty()) {
            quads.add(this);
        }

        for (var child : getChildrenWithin(area)) {
            quads.addAll(child.find(area, minDepth));
        }

        return quads;
    }

    public List<Quad<T>> findOrCreate(Area area, int minDepth) {
        var quads = new ArrayList<Quad<T>>();
        if (depth >= minDepth && withinArea(area)) {
            return List.of(this);
        }

        if (withinArea(area) && getChildrenWithin(area).isEmpty()) {
            initChildren();
        }

        System.out.println(getChildrenWithin(area).size());
        for (var child : getChildrenWithin(area)) {
            quads.addAll(child.findOrCreate(area, minDepth));
        }

        return quads;
    }

    public void setQuad(Quad<T> quad, Section section) {
        quad.parent = this;
        quad.depth = depth + 1;
        quad.width = width / 2;
        quad.height = height / 2;

        quad.position = switch (section) {
            case NE -> new GeoPosition(position.lat + (height/4), position.lng + (width/4));
            case SE -> new GeoPosition(position.lat - (height/4), position.lng + (width/4));
            case SW -> new GeoPosition(position.lat - (height/4), position.lng - (width/4));
            case NW -> new GeoPosition(position.lat + (height/4), position.lng - (width/4));
        };

        children.put(section, quad);
    }

    public Optional<Quad<T>> getQuad(Section section) {
        return Optional.ofNullable(children.get(section));
    }

    public Area asArea() {
        var ne = new GeoPosition(position.lat + height/2, position.lng + width/2);
        var sw = new GeoPosition(position.lat - height/2, position.lng - width/2);
        return new Area(ne, sw);
    }

    public boolean isLeaf() {
        return children.isEmpty();
    }

    private void initChildren() {
        for( var section : Section.values()) {
            if (!children.containsKey(section))
                setQuad(new Quad<>(null), section);
        }
    }

    private List<Quad<T>> getChildrenWithin(Area area) {
        return children.values().stream().filter(s -> s.withinArea(area)).toList();
    }

    private boolean withinArea(Area area) {
        return asArea().intersects(area);
        //return position.distance(area.midPoint()) <= width;
    }

    public static <T> Quad<T> createRoot(T value, int maxDepth) {
        return new Quad<>(value, null, GeoPosition.EQUATOR, 180 * 2, 90 * 2, 0);
    }
}
