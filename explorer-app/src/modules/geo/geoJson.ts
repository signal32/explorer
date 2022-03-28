import {GeoEntity} from '@/modules/geo/entity';
import {FeatureCollection, Geometry, Feature} from 'geojson';

export function toGeoJsonFeature(entity: GeoEntity): Feature<Geometry, GeoEntity> {
    let position = entity.position;
    if (position.lng == undefined) position = JSON.parse(position as any);
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [position.lng, position.lat],
        },
        id: entity.id,
        properties: entity
    }
}

export function toFeatureCollection(entities: GeoEntity[]): FeatureCollection<Geometry, GeoEntity> {
    return {
        type: 'FeatureCollection',
        features: entities.map(e => {return toGeoJsonFeature(e)})
    }
}