package com.curioustrout.explorer.core.geo;

public class Area implements Comparable<Area>{

    public static final Area GEO_TEST_BOX = new Area(new GeoPosition(10,10),new GeoPosition(-10,-10));
    public static final Area GEO_WORLD = new Area(new GeoPosition(89,179),new GeoPosition(-89,-179));
    public static final Area GEO_HALF_WORLD = new Area(new GeoPosition(90,140),new GeoPosition(-90,-140));



    private GeoPosition ne;
    private GeoPosition sw;

    public Area(GeoPosition ne, GeoPosition sw) {
        this.ne = ne;
        this.sw = sw;
    }

    public GeoPosition getNe() {
        return ne;
    }

    public void setNe(GeoPosition ne) {
        this.ne = ne;
    }

    public GeoPosition getSw() {
        return sw;
    }

    public void setSw(GeoPosition sw) {
        this.sw = sw;
    }

    // TODO: 12/02/2022 Fix midpoint calculation for large areas 
    public GeoPosition midPoint(){
        var mid = sw.midpoint(ne);
        return (mid.lng < 179) ? mid : GeoPosition.EQUATOR;
    }

    public double crossSection() {
        return this.ne.distance(this.sw);
    }

    public boolean intersects(Area other) {
        return !(other.ne.lng <= this.sw.lng ||
                 other.sw.lng >= this.ne.lng ||
                 other.ne.lat <= this.sw.lat ||
                 other.sw.lat >= this.ne.lat );
    }

    public boolean touches(Area other) {
        return !(other.ne.lng < this.sw.lng ||
                other.sw.lng > this.ne.lng ||
                other.ne.lat < this.sw.lat ||
                other.sw.lat > this.ne.lat );
    }

    public boolean contains(Area other) {
        return (
                other.sw.lng <= this.ne.lng && other.sw.lng >= this.sw.lng && // Bottom left horizontal
                other.sw.lat <= this.ne.lat && other.sw.lng >= this.sw.lat && // bottom left vertical
                other.ne.lng <= this.ne.lng && other.ne.lng >= this.sw.lng && // Top right Horizontal
                other.ne.lat <= this.ne.lat && other.ne.lng >= this.sw.lat    // Top right Vertical
        );
    }

    @Override
    public int compareTo(Area o) {
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

    @Override
    public String toString() {
        return "Area{" +
                "ne=" + ne +
                ", sw=" + sw +
                '}';
    }

    public static Area of(double neLat, double neLng, double swLat, double swLng){
        return new Area(new GeoPosition(neLat,neLng), new GeoPosition(swLat, swLng));
    }

    public static Area fromPosition(GeoPosition position, double radius) {
        return new Area(
                new GeoPosition(position.lat + radius, position.lng + radius),
                new GeoPosition(position.lat - radius, position.lng - radius));
    }
}
