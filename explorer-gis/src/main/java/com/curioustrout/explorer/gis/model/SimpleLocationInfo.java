package com.curioustrout.explorer.gis.model;

import org.locationtech.jts.geom.Coordinate;

public class SimpleLocationInfo implements LocationInfo {

    private String name;
    private String id;
    private Coordinate coordinate;

    public SimpleLocationInfo(String name, String id, Coordinate coordinate) {
        this.name = name;
        this.id = id;
        this.coordinate = coordinate;
    }

    @Override
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @Override
    public Coordinate getCoordinate() {
        return coordinate;
    }

    public void setCoordinate(Coordinate coordinate) {
        this.coordinate = coordinate;
    }
}
