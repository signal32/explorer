import {LatLngBounds} from '@/modules/geo/types';
import {FeatureCollection, Geometry} from 'geojson';
import {IEntityAbstract, IEntityDetails} from '@/modules/geo/entity';

export interface IQueryPlugin {

    getAbstract(... items: [string]): Promise<IEntityAbstract[]>,
    getAbstractArea(area: LatLngBounds): Promise<FeatureCollection<Geometry, IEntityAbstract>>,

    getDetails(... items: [string]): Promise<IEntityDetails>,
}

