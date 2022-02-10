package com.curioustrout.explorer.gis.util;

public class GeoArea implements Comparable<GeoArea>{

    public static final GeoArea TEST_BOX = new GeoArea(new Position(10,10),new Position(-10,-10));
    public static final GeoArea WORLD = new GeoArea(new Position(90,180),new Position(-90,-180));

    private Position ne;
    private Position sw;

    public GeoArea(Position ne, Position sw) {
        this.ne = ne;
        this.sw = sw;
    }

    public Position getNe() {
        return ne;
    }

    public void setNe(Position ne) {
        this.ne = ne;
    }

    public Position getSw() {
        return sw;
    }

    public void setSw(Position sw) {
        this.sw = sw;
    }

    public Position nw() {
        return new Position(ne.lat, sw.lng);
    }

    public Position se() {
        return new Position(sw.lat, ne.lng);
    }

    public Position midPoint(){
        return sw.midpoint(ne);
    }

    public double crossSection() {
        return this.ne.distance(this.sw);
    }

    public boolean intersects(GeoArea other) {
        return !(other.ne.lng <= this.sw.lng ||
                 other.sw.lng >= this.ne.lng ||
                 other.ne.lat <= this.sw.lat ||
                 other.sw.lat >= this.ne.lat );
    }

    public boolean touches(GeoArea other) {
        return !(other.ne.lng < this.sw.lng ||
                other.sw.lng > this.ne.lng ||
                other.ne.lat < this.sw.lat ||
                other.sw.lat > this.ne.lat );
    }

    public boolean contains(GeoArea other) {
        return (
                other.sw.lng <= this.ne.lng && other.sw.lng >= this.sw.lng && // Bottom left horizontal
                other.sw.lat <= this.ne.lat && other.sw.lng >= this.sw.lat && // bottom left vertical
                other.ne.lng <= this.ne.lng && other.ne.lng >= this.sw.lng && // Top right Horizontal
                other.ne.lat <= this.ne.lat && other.ne.lng >= this.sw.lat    // Top right Vertical
        );
    }

    @Override
    public int compareTo(GeoArea o) {
        return (int) (this.crossSection() - o.crossSection());
    }

    @Override
    public boolean equals(Object obj) {
        return super.equals(obj);
    }

    @Override
    public int hashCode() {
        return super.hashCode();
    }

    public static GeoArea of(double neLat, double neLng, double swLat, double swLng){
        return new GeoArea(new Position(neLat,neLng), new Position(swLat, swLng));
    }
}
