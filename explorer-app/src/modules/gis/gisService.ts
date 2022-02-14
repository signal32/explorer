import {createAxios} from '@/modules/axios/setup';
import {LngLat} from 'maplibre-gl';
import {defineWikiDataPlugin} from '@/modules/query/WikidataPlugin';
import {LatLngBounds} from '@/modules/geo/types';

//todo get from env
const API_URL = 'http://10.1.0.20:8086/';



const axios = createAxios({
    baseURL: API_URL,
    timeout: 1500,
});

const wikidata = defineWikiDataPlugin({sparqlEndpoints: ['https://query.wikidata.org/sparql'], });

class GisService {

    public getGeoJson(position: LngLat, zoom: number): Promise<JSON> {
        if (wikidata.getAbstractArea) {
            wikidata.getAbstractArea(LatLngBounds.fromMapBox(position.toBounds(1)));
        }
        return axios.get(`/geoJson/${zoom}/${position.lng}/${position.lat}`)
            .then(async res => {
                console.log('Got geoJSON:', res.data);
                return res.data;
            })
            .catch( err => {
                console.error('geoJSON failed:' + err);
                throw err;
            })

    }

/*    public getGeoJson(position: LngLatBounds): Promise<Object> {

    }*/

}

export default new GisService();