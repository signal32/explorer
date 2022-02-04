package com.curioustrout.explorer.gis.util;

import org.locationtech.jts.geom.Coordinate;

public class GeoArea implements Comparable<GeoArea>{
    private Coordinate ne;
    private Coordinate sw;

    public GeoArea(Coordinate ne, Coordinate sw) {
        this.ne = ne;
        this.sw = sw;
    }

    public Coordinate getNe() {
        return ne;
    }

    public void setNe(Coordinate ne) {
        this.ne = ne;
    }

    public Coordinate getSw() {
        return sw;
    }

    public void setSw(Coordinate sw) {
        this.sw = sw;
    }

    public double distance() {
        return this.ne.distance(this.sw);
    }


    @Override
    public int compareTo(GeoArea o) {
        return (int) (this.distance() - o.distance());
    }

    @Override
    public boolean equals(Object obj) {
        return super.equals(obj);
    }

    @Override
    public int hashCode() {
        return super.hashCode();
    }
}
