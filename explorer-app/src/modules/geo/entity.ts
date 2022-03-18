import {LatLngLike} from '@/modules/geo/types';

export interface Entity {
    id: string,
    name: string,
    category?: Entity,
}

export interface EntityPosition {
    position: LatLngLike,
}

export interface EntityName {

}

export interface GeoEntity extends Entity {
    position: LatLngLike
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