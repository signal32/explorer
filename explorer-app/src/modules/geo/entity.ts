import {LatLngLike} from '@/modules/geo/types';

export interface IEntityAbstract {
    position: LatLngLike,
    category: ICategory,
    name: string,
}

export interface IEntityDetails {
    abstract: IEntityAbstract,
    values: Map<string, any>,
}

export interface ICategory {
    name: string,
}