import {Plugin, PluginConfig} from '@/modules/plugin/pluginManager';
import {QueryService} from '@/modules/query/queryService';
import {services, Services} from '@/modules/app/services';
import {CategoryEntity, GeoEntity} from '@/modules/geo/entity';
import {LatLngBounds} from '@/modules/geo/types';
import {FeatureCollection, Geometry} from 'geojson';

export class FooBarPlugin implements Plugin, QueryService {

    constructor(private foo: string = 'bar') {}

    initialise(services: Services): PluginConfig {
        return {
            // Metadata is used to describe the plugin to users
            metadata: {
                name: 'FooBarPlugin',
                description: 'Hello world',
                version: '0.0.1'
            },

            // Register a parameter 'foo' that can be modified in the plugin settings menu
            params: [{
                name: 'foo',
                type: 'string', // Controls how param is rendered in UI
                default: 'bar',
                get: () => (this.foo), // Allow application to read param value
                set: value => this.foo = value // Allow application to set param value
            }],

            // These hooks are called when the plugin is enabled/disabled.
            // perform registration with the plugins intended services here.
            onEnable: () => services.queryService.register(this),
            onDisable: () => services.queryService.remove(this),
        };
    }

    getById(id: string): Promise<GeoEntity | undefined> {
        //TODO Resolve promise with an entity by the provided ID
        return Promise.reject();
    }

    getByArea(area: LatLngBounds, categories?: CategoryEntity[], name?: string, cache?: boolean): Promise<FeatureCollection<Geometry, GeoEntity>> {
        //TODO Resolve promise with the entities in the given area
        return Promise.reject();
    }

    getbyLocation(location: GeoEntity): Promise<GeoEntity[]> {
        //TODO Resolve promise with entities in the given location
        return Promise.reject();
    }
}

export const foobarPlugin = new FooBarPlugin();

services.pluginManager?.loadPlugin(foobarPlugin);