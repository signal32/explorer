package com.curioustrout.explorer.core.geo;


import static java.lang.Math.*;

public class GeoPosition {

    public static final GeoPosition EQUATOR = new GeoPosition(0,0);

    public final double lat;
    public final double lng;
    public final double alt;

    public GeoPosition(double lat, double lng, double alt) {
        this.lat = lat;
        this.lng = lng;
        this.alt = alt;
    }

    public GeoPosition(double lat, double lng) {
        this(lat, lng, 0.0);
    }

    /**
     * Calculate distance between two points in latitude and longitude taking
     * into account height difference. If you are not interested in height
     * difference pass 0.0. Uses Haversine method as its base.
     *
     * @param other The other {@link GeoPosition}
     *
     * @return Distance in Meters
     */
    public double distance(GeoPosition other) {

        final int R = 6371;

        double latDistance = toRadians(other.lat - this.lat);
        double lonDistance = toRadians(other.lng - this.lng);
        double a = sin(latDistance / 2) * sin(latDistance / 2)
                + cos(toRadians(this.lat)) * cos(toRadians(other.lat))
                * sin(lonDistance / 2) * sin(lonDistance / 2);
        double c = 2 * atan2(sqrt(a), sqrt(1 - a));
        double distance = R * c * 1000; // convert to meters

        double height = this.alt - other.alt;
        distance = pow(distance, 2) + pow(height, 2);

        return sqrt(distance);
    }

    //https://stackoverflow.com/questions/4656802/midpoint-between-two-latitude-and-longitude

    public GeoPosition midpoint(GeoPosition other) {
        return midpoint(this, other);
    }

/*    private static double projectLngToX(double lng) {
        return toRadians(lng) * RADIUS_MAJOR;
    }

    private static double projectLatToY(double lat) {
        return log(tan(PI / 4 + toRadians(lat) / 2)) * RADIUS_MAJOR;
    }

    public Poin project() {
        var x = projectLngToX(lng);
        var y =projectLatToY(lat);
        return new Position(x,y,alt);
    }

    public Position projectPrecise() {
        var x = RADIUS_MAJOR * toRadians(lng);

        var latBounded = min(max(lat,-89.5),89.5);
        var normalisedEarthDims = 1.0 - pow(RADIUS_MINOR/RADIUS_MAJOR,2);
        var projLat = sqrt(normalisedEarthDims) * sin(toRadians(latBounded));
        projLat = pow(((1.0 - projLat) / (1.0 + projLat)), 0.5 * sqrt(normalisedEarthDims));
        var projLatNorm = tan(0.5 * ((PI * 0.5) - toRadians(latBounded))) / projLat;
        var y = (-1) * RADIUS_MAJOR * log(projLatNorm);

        return new Position(x,y,alt);
    }*/

    @Override
    public String toString() {
        return "GeoPosition{" +
                "lat=" + lat +
                ", lng=" + lng +
                ", alt=" + alt +
                '}';
    }

    public static GeoPosition midpoint(GeoPosition p1, GeoPosition p2){
        double dLon = toRadians(p2.lng - p1.lng);

        //convert to radians
        var lat1 = toRadians(p1.lat);
        var lat2 = toRadians(p2.lat);
        var lng1 = toRadians(p1.lng);

        double bx = cos(lat2) * cos(dLon);
        double by = cos(lat2) * sin(dLon);
        double lat3 = atan2(sin(lat1) + sin(lat2), sqrt((cos(lat1) + bx) * (cos(lat1) + bx) + by * by));
        double lon3 = lng1 + atan2(by, cos(lat1) + bx);

        return new GeoPosition(toDegrees(lat3), toDegrees(lon3));
    }

}
