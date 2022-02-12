package com.curioustrout.explorer.gis.geo;

public class Area implements Comparable<Area>{

    public static final Area GEO_TEST_BOX = new Area(new GeoPosition(10,10),new GeoPosition(-10,-10));
    public static final Area GEO_WORLD = new Area(new GeoPosition(89,179),new GeoPosition(-89,-179));
    public static final Area GEO_HALF_WORLD = new Area(new GeoPosition(90,140),new GeoPosition(-90,-140));

    public static final Area TEST_BOX = new Area(new Position(100, 100), new Position(0, 0));

    public static final Area WORLD_EUCLIDEAN = new Area(
            new GeoPosition(89.9,179.9).project(),
            new GeoPosition(-89.9,-179.9).project()
    );

    private Position ne;
    private Position sw;

    public Area(Position ne, Position sw) {
        this.ne = ne;
        this.sw = sw;
    }

    public Position getNe() {
        return ne;
    }

    public void setNe(GeoPosition ne) {
        this.ne = ne;
    }

    public Position getSw() {
        return sw;
    }

    public void setSw(GeoPosition sw) {
        this.sw = sw;
    }

    public Position nw() {
        return new Position(ne.x, sw.y);
    }

    public Position se() {
        return new Position(sw.x, ne.y);
    }

    public Position midPoint(){
        return sw.midpoint(ne);
    }

    public double crossSection() {
        return this.ne.distance(this.sw);
    }

    public boolean intersects(Area other) {
        return !(other.ne.x <= this.sw.x ||
                 other.sw.x >= this.ne.x ||
                 other.ne.y <= this.sw.y ||
                 other.sw.y >= this.ne.y );
    }

    public boolean touches(Area other) {
        return !(other.ne.x < this.sw.x ||
                other.sw.x > this.ne.x ||
                other.ne.y < this.sw.y ||
                other.sw.y > this.ne.y );
    }

    public boolean contains(Area other) {
        return (
                other.sw.x <= this.ne.x && other.sw.x >= this.sw.x && // Bottom left horizontal
                other.sw.y <= this.ne.y && other.sw.x >= this.sw.y && // bottom left vertical
                other.ne.x <= this.ne.x && other.ne.x >= this.sw.x && // Top right Horizontal
                other.ne.y <= this.ne.y && other.ne.x >= this.sw.y    // Top right Vertical
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
}
