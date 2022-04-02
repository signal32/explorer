import {GeoEntity} from '@/modules/geo/entity';
import {Feature, Geometry} from 'geojson';

/**
 * Convert a GeoEntity into a GeoJSON feature.
 * @param feature The feature to convert.
 */
export function asFeature(feature: GeoEntity): Feature<Geometry, GeoEntity> {
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [feature.position.lng, feature.position.lat],
        },
        properties: feature,
    }
}