import {LatLng} from '@/modules/geo/types';
import {reactive} from 'vue';
import {Geolocation} from '@awesome-cordova-plugins/geolocation';
import {Geoposition} from '@awesome-cordova-plugins/geolocation';

export interface GeolocationService {
    location: LatLng,
    start: () => any,
    stop: () => any,
}

let watch: any;

function defineGeolocationService():GeolocationService {
    const obj: GeolocationService = {
        location:  new LatLng(0, 0),

        start() {

            const watch = Geolocation.watchPosition();
            watch.subscribe((data => {
                if ('coords' in data) {
                    console.log(`New location ${data.coords.latitude} ${data.coords.longitude}`)
                    this.location = new LatLng(data.coords.latitude, data.coords.longitude)
                }
                else console.error(data);
            }));
        },

        stop() {
            watch?.unsubscribe();
        }
    };

    return reactive(obj);
}

/*
class WebGeoLocationService implements GeolocationService {

    constructor(private watch: any = undefined) {}

    location =  new LatLng(0, 0);

    start() {

        const watch = Geolocation.watchPosition();
        watch.subscribe((data => {
            if ('coords' in data) {
                console.log(`New location ${data.coords.latitude} ${data.coords.longitude}`)
                this.location = new LatLng(data.coords.latitude, data.coords.longitude)
            }
            else console.error(data);
        }));
    }

    stop() {
        this.watch?.unsubscribe();
    }
}
*/

export const geolocationService = defineGeolocationService();
