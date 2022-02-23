import {LatLngBounds} from '@/modules/geo/types';
import {FeatureCollection, Geometry} from 'geojson';
import {GeoEntity, DetailsEntity} from '@/modules/geo/entity';

export interface IQueryPlugin {

    getAbstract(... items: [string]): Promise<GeoEntity[]>,
    getAbstractArea(area: LatLngBounds): Promise<FeatureCollection<Geometry, GeoEntity>>,

    getDetails(... items: [string]): Promise<DetailsEntity>,
}

