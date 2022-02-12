package com.curioustrout.explorer.gis.geo;

import java.util.Objects;

public class Position {

    public final double x;
    public final double y;
    public final double z;

    public Position(double x, double y, double z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public Position(Position position) {
        this.x = position.x;
        this.y = position.y;
        this.z = position.z;
    }

    public Position(double x, double y) {
        this(x,y,0.0);
    }

    public double distance(Position other) {
        return distance(this, other);
    }

    public Position midpoint(Position other) {
        return midpoint(this, other);
    }

    public static double distance(Position p1, Position p2) {
        double dx = p1.x - p2.x;
        double dy = p1.y - p2.y;
        double dz = p1.z - p2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    public static Position midpoint(Position p1, Position p2) {
        return new Position((p1.x + p2.x)/2, (p1.y + p2.y)/2, (p1.y + p2.y)/2);
    }

    @Override
    public String toString() {
        return "Position{" +
                "x=" + x +
                ", y=" + y +
                ", z=" + z +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Position p)) return false;
        return (this.x == p.x && this.y == p.y && this.z == p.z);
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y, z);
    }
}