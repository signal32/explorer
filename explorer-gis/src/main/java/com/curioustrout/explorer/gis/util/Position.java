package com.curioustrout.explorer.gis.util;

import java.util.Objects;

public class Position {

    public final double lat;
    public final double lng;
    public final double alt;

    public Position(double lat, double lng, double alt) {
        this.lat = lat;
        this.lng = lng;
        this.alt = alt;
    }

    public Position(double lat, double lng) {
        this(lat, lng, 0.0);
    }

    /**
     * Calculate distance between two points in latitude and longitude taking
     * into account height difference. If you are not interested in height
     * difference pass 0.0. Uses Haversine method as its base.
     *
     * @param other The other {@link Position}
     *
     * @return Distance in Meters
     */
    public double distance(Position other) {

        final int R = 6371;

        double latDistance = Math.toRadians(other.lat - this.lat);
        double lonDistance = Math.toRadians(other.lng - this.lng);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(this.lat)) * Math.cos(Math.toRadians(other.lat))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c * 1000; // convert to meters

        double height = this.alt - other.alt;
        distance = Math.pow(distance, 2) + Math.pow(height, 2);

        return Math.sqrt(distance);
    }

    //https://stackoverflow.com/questions/4656802/midpoint-between-two-latitude-and-longitude

    public Position midpoint(Position other) {
        return midpoint(this, other);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Position p)) return false;
        return (this.lng == p.lng && this.lat == p.lat && this.alt == p.lat);
    }

    @Override
    public String toString() {
        return "Position{" +
                "lat=" + lat +
                ", lng=" + lng +
                ", alt=" + alt +
                '}';
    }

    @Override
    public int hashCode() {
        return Objects.hash(lat, lng, alt);
    }

    public static Position midpoint(Position p1, Position p2){
        double dLon = Math.toRadians(p2.lng - p1.lng);

        //convert to radians
        var lat1 = Math.toRadians(p1.lat);
        var lat2 = Math.toRadians(p2.lat);
        var lng1 = Math.toRadians(p1.lng);

        double bx = Math.cos(lat2) * Math.cos(dLon);
        double by = Math.cos(lat2) * Math.sin(dLon);
        double lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bx) * (Math.cos(lat1) + bx) + by * by));
        double lon3 = lng1 + Math.atan2(by, Math.cos(lat1) + bx);

        return new Position(Math.toDegrees(lat3), Math.toDegrees(lon3));
    }

}
