import {toDegrees, toRadians} from '@/modules/util/math';
import {LngLatBounds} from 'maplibre-gl';

export interface LatLngLike {
    lat: number,
    lng: number,
}

export class LatLng implements LatLngLike {
    lat: number;
    lng: number;

    constructor(lat: number, lng: number) {
        this.lat = lat;
        this.lng = lng;
    }

    /**
     * Calculate the distance between this and another point.
     * @param other
     */
    distance(other: LatLngLike): number {
        const R = 6371;

        const latDistance = toRadians(other.lat - this.lat);
        const lngDistance = toRadians(other.lng - this.lng);
        const a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
            + Math.cos(toRadians(this.lat)) * Math.cos(toRadians(other.lat))
            * Math.sin(lngDistance / 2) * Math.sin(lngDistance /2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c * 1000; //convert to meters

        return distance;
    }

    /**
     * Point that lies in the middle of this and another point.
     */
    midpoint(other: LatLngLike): LatLng {
        const dLon = toRadians(other.lng - this.lng);

        const lat1 = toRadians(this.lat);
        const lat2 = toRadians(other.lat);
        const lng1 = toRadians(this.lng);

        const bx = Math.cos(lat2) * Math.cos(dLon);
        const by = Math.cos(lat2) * Math.sin(dLon);
        const lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bx) * (Math.cos(lat1) + bx) + by * by));
        const lon3 = lng1 + Math.atan2(by, Math.cos(lat1) + bx);

        return new LatLng(toDegrees(lat3), toDegrees(lon3));
    }

}

export interface LatLngBoundsLike {
    ne: LatLngLike,
    sw: LatLngLike,
}

export class LatLngBounds implements LatLngBoundsLike {
    ne: LatLng;
    sw: LatLng;

    constructor(ne: LatLng, se: LatLng) {
        this.ne = ne;
        this.sw = se;
    }

    crossSection(): number {
        return this.ne.distance(this.sw)
    }

    intersects(other: LatLngBoundsLike): boolean {
        return !(other.ne.lng <= this.sw.lng ||
            other.sw.lng >= this.ne.lng ||
            other.ne.lat <= this.sw.lat ||
            other.sw.lat >= this.ne.lat );
    }

    touches(other: LatLngBoundsLike): boolean {
        return !(other.ne.lng < this.sw.lng ||
            other.sw.lng > this.ne.lng ||
            other.ne.lat < this.sw.lat ||
            other.sw.lat > this.ne.lat );
    }

    contains(other: LatLngBoundsLike): boolean {
        return (
            other.sw.lng <= this.ne.lng && other.sw.lng >= this.sw.lng && // Bottom left horizontal
            other.sw.lat <= this.ne.lat && other.sw.lng >= this.sw.lat && // bottom left vertical
            other.ne.lng <= this.ne.lng && other.ne.lng >= this.sw.lng && // Top right Horizontal
            other.ne.lat <= this.ne.lat && other.ne.lng >= this.sw.lat    // Top right Vertical
        );
    }

    static fromMapBox(bounds: LngLatBounds): LatLngBounds {
        return new LatLngBounds(new LatLng(bounds._ne.lat, bounds._ne.lng), new LatLng(bounds._sw.lat, bounds._sw.lng))
    }
}


