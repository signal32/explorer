import {LatLngBounds, LatLngLike} from '@/modules/geo/types';
import {FeatureCollection, Geometry} from 'geojson';

export interface IQueryPlugin {

    getAbstract?(... items: [string]): Promise<IEntityAbstract[]>,
    getAbstractArea?(area: LatLngBounds): Promise<FeatureCollection<Geometry, IEntityAbstract>>,

    getDetails?(... items: [string]): Promise<IEntityDetails>,
}

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

interface IPluginConfig {
    friendlyName: string,
    isEnabled: boolean,
    serviceURL: boolean,
}