import {LatLngLike} from '@/modules/geo/types';

export interface Entity {
    id: string,
    name: string,
    category?: CategoryEntity,

    /**
     * A small image that can be retrieved quickly.
     */
    thumbnailUrl?: string,
}

export interface EntityPosition {
    position: LatLngLike,
}

export interface EntityName {

}

export interface GeoEntity extends Entity {

    /**
     * Global position of this entity.
     */
    position: LatLngLike,

    /**
     * Some geographic entity within which this resides.
     */
    within?: GeoEntity,
}

export interface DetailsEntity extends Entity{
    values: Map<string, any>,
}

/*export interface Category {
    name: string,
}*/

export interface CategoryEntity extends Entity {
    iconUrl?: string,
}

export type EntityId = string;