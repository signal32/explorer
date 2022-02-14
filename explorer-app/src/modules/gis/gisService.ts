import {createAxios} from '@/modules/axios/setup';
import {LngLat} from 'maplibre-gl';
import {defineWikiDataPlugin} from '@/modules/query/WikidataPlugin';
import {LatLngBounds} from '@/modules/geo/types';
import {Feature, FeatureCollection} from 'geojson';
import {IEntityAbstract} from '@/modules/query/interfaces';

//todo get from env
const API_URL = 'http://10.1.0.20:8086/';



const axios = createAxios({
    baseURL: API_URL,
    timeout: 1500,
});

const wikidata = defineWikiDataPlugin({sparqlEndpoints: ['https://query.wikidata.org/sparql'], });

class GisService {

    private static toFeature(feature: IEntityAbstract): Feature {
        console.log(feature);
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [feature.position.lng, feature.position.lat],
            },
            properties: {
                name: feature.name,
                category: feature.category,
            }
        }
    }

    public async getGeoJson(position: LngLat, zoom: number): Promise<FeatureCollection> {

        const features: FeatureCollection = {
            type: 'FeatureCollection',
            features: [],
        }


        if (wikidata.getAbstractArea) {
            wikidata.getAbstractArea(LatLngBounds.fromMapBox(position.toBounds(100))).then(plcs => {
                console.log('got' + plcs.length);
                plcs.forEach(p => features.features.push(GisService.toFeature(p)))
            });
        }

        console.log('Features:', features);

        return features;

/*        return axios.get(`/geoJson/${zoom}/${position.lng}/${position.lat}`)
            .then(async res => {
                console.log('Got geoJSON:', res.data);
                return res.data;
            })
            .catch(err => {
                console.error('geoJSON failed:' + err);
                throw err;
            })*/

    }

/*    public getGeoJson(position: LngLatBounds): Promise<Object> {

    }*/

}

export default new GisService();