import {toDegrees, toRadians} from '@/modules/util/math';

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

        let latDistance = toRadians(other.lat - this.lat);
        let lngDistance = toRadians(other.lng - this.lng);
        let a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
            + Math.cos(toRadians(this.lat)) * Math.cos(toRadians(other.lat))
            * Math.sin(lngDistance / 2) * Math.sin(lngDistance /2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let distance = R * c * 1000; //convert to meters

        return distance;
    }

    /**
     * Point that lies in the middle of this and another point.
     */
    midpoint(other: LatLngLike): LatLng {
        let dLon = toRadians(other.lng - this.lng);

        let lat1 = toRadians(this.lat);
        let lat2 = toRadians(other.lat);
        let lng1 = toRadians(this.lng);

        let bx = Math.cos(lat2) * Math.cos(dLon);
        let by = Math.cos(lat2) * Math.sin(dLon);
        let lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bx) * (Math.cos(lat1) + bx) + by * by));
        let lon3 = lng1 + Math.atan2(by, Math.cos(lat1) + bx);

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
}


