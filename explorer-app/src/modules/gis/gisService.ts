import {createAxios} from '@/modules/axios/setup';
import {LngLat} from 'maplibre-gl';
import {defineWikiDataPlugin} from '@/modules/query/WikidataPlugin';
import {LatLngBounds} from '@/modules/geo/types';
import {FeatureCollection} from 'geojson';

//todo get from env
const API_URL = 'http://10.1.0.20:8086/';



const axios = createAxios({
    baseURL: API_URL,
    timeout: 1500,
});

const wikidata = defineWikiDataPlugin({sparqlEndpoints: ['https://query.wikidata.org/sparql'], });

class GisService {


    public async getGeoJson(position: LngLat, zoom: number): Promise<FeatureCollection> {

        let features: FeatureCollection = {features: [], type: 'FeatureCollection'};

        if (wikidata.getAbstractArea) {
            features = await wikidata.getAbstractArea(LatLngBounds.fromMapBox(position.toBounds(100)));
        }
        return features;
    }

/*    public getGeoJson(position: LngLatBounds): Promise<Object> {

    }*/

}

export default new GisService();