import {IQueryPlugin} from '@/modules/plugin/interfaces/queryPlugin';
import {Bindings} from '@comunica/bus-query-operation';
import {DataFactory, NamedNode} from 'rdf-data-factory';
import {newEngine} from '@comunica/actor-init-sparql';
import {LatLng, LatLngBounds} from '@/modules/geo/types';
import {Feature, FeatureCollection, Geometry} from 'geojson';
import {GeoEntity, DetailsEntity, Entity, CategoryEntity} from '@/modules/geo/entity';
import testQuery from './sparql/testQuery.sparql';
import {AppPlugin, PluginConfig, PluginParameter} from '@/modules/plugin/interfaces/pluginConfiguration';
import {AppServices} from '@/modules/app/services';
import {CategoryPlugin} from '@/modules/plugin/interfaces/categoryPlugin';
import {Index} from 'flexsearch';
import selectCategories from './sparql/selectCategories.sparql';
import {NotificationType} from '@/modules/app/notification';

const engine = newEngine();
const factory = new DataFactory();

const DEFAULT_LIKED = 'wd:Q12280 wd:Q811979 wd:Q3947';
const DEFAULT_DISLIKED = 'wd:Q13276'

/**
 * A plugin for integration with the WikiData knowledge base.
 */
interface WikiDataPlugin extends IQueryPlugin, AppPlugin, CategoryPlugin {
    endpoint: PluginParameter<string>,
    categories?: CategoryEntity[],
    categoryIndex?: Index,
    setupIndex(): any,
}

/**
 * Convert RDF type wktLiteral to a {@link LatLng} for use internally.
 * @param literal The literal to convert. Of form 'Point(lat, lng)' where lat, lng are numbers.
 */
function wktLiteralToLatLng(literal: string): LatLng {
    const values = literal.match(/-?\d+.\d*/gm);
    if (values) {
        return new LatLng(parseFloat(values[1]), parseFloat(values[0]));
    }
    else {
        console.warn(`Could not convert wktLiteral to LatLng. Value: ${literal}`);
        return new LatLng(0,0);
    }
}

/**
 * Convert a GeoEntity into a GeoJSON feature.
 * @param feature The feature to convert.
 */
function asFeature(feature: GeoEntity): Feature<Geometry, GeoEntity> {
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [feature.position.lng, feature.position.lat],
        },
        properties: feature,
    }
}

function wikidataIdFromUrl(url: string): string {
    const matches = url.match(/Q\d*/gm);
    if (matches) {
        return matches[0]
    }
    else return '';
}

/**
 * Create a new instance of {@link WikiDataPlugin}.
 * @param sparqlEndPoint WikiData SPARQL endpoint URL to connect to.
 */
export function defineWikiDataPlugin(sparqlEndPoint: string): WikiDataPlugin {
    return {
        endpoint: {
            name: 'Sparql endpoint',
            scope: 'settings',
            value: sparqlEndPoint,
        },

        definePlugin(): PluginConfig {
            return {
                friendlyName: 'WikiData Plugin',
                params: [
                    this.endpoint,
                ]
            }
        },

        async setupIndex() {
            this.categoryIndex = new Index({
                charset: 'latin:extra',
                preset: 'match',
                tokenize: 'strict',
                cache: false,
            });

            const categories = await this.getCategoryList();
            categories.forEach(c => {
                this.categoryIndex?.add(c.id, c.name)
            });
        },

        /**
         * Get categories that have been cached in local storage and fetch them from WikiData if not.
         */
        async getCategoryList(): Promise<CategoryEntity[]> {

            if (this.categories && this.categories.length > 1) {
                console.log(this.categories[1])
                return Promise.resolve(this.categories);
            }

            const storageKey = 'categories_cache';
            this.categories = await AppServices.commonStore.get(storageKey) as CategoryEntity[];

            if (this.categories) {
                return Promise.resolve(this.categories);
            }

            else {
                console.log('WikiData plugin did not find cached categories. Retrieving now...');
                this.categories = [];
                const result = await engine.query(selectCategories, {
                    sources: [{type: 'sparql', value: this.endpoint.value}]
                });

                if (result.type == 'bindings') {
                    return new Promise(((resolve, reject) => {
                        // Collect data from categories
                        result.bindingsStream.on('data', listener => {
                            const category = {
                                id: wikidataIdFromUrl(listener.get('?target').value),
                                name: listener.get('?label').value,
                                //iconUrl: listener.get('?icon').value,
                            }
                            console.log(category);
                            this.categories?.push(category);
                        });

                        // Should wait and be resolved only when all bindings have been processed
                        result.bindingsStream.on('end', () => {
                            AppServices.commonStore.set(storageKey, this.categories)
                            resolve(this.categories || []);
                        });

                        // Catch any errors while reading for rejection
                        result.bindingsStream.on('error', (error) => {
                            console.error('WikiData retrieval failed: ' + error)
                            reject(error);
                        })
                    }));
                }

                else {
                    return Promise.reject('Unable to get categories from WikiData: Not bindings type')
                }
            }
        },

        async searchCategoryLabels(term: string): Promise<CategoryEntity[]> {
            if (!this.categoryIndex) this.setupIndex();

            const ids = this.categoryIndex?.search(term, 10) || [];
            const names = this.categories
                ?.filter(c => ids.includes(c.id)); // HACK This will be slow!

            return Promise.resolve(names || []);
        },


        async getCategoryFromLabel(): Promise<CategoryEntity[]> {
            return Promise.reject('Not implemented');
        },

        async getAbstractArea(area: LatLngBounds): Promise<FeatureCollection<Geometry, GeoEntity>> {

            let included = '';
            if (AppServices.userPreferencesStore.liked.length > 0) {
                AppServices.userPreferencesStore.liked.forEach( liked => {
                    included += (`wd:${liked.entity.id} `);
                })
            }
            else included = DEFAULT_LIKED;

            let excluded = '';
            if (AppServices.userPreferencesStore.disliked.length > 0) {
                AppServices.userPreferencesStore.disliked.forEach( disliked => {
                    included += (`wd:${disliked.entity.id} `);
                })
            }
            else excluded = DEFAULT_DISLIKED;

            console.log('excluded: ', excluded);
            //const newQ = testQuery.replace('?@include', 'wd:Q12280 wd:Q811979 wd:Q3947' ).replace('?@exclude', 'wd:Q3947')
            const newQ = testQuery.replace('?@include', included ).replace('?@exclude', excluded) //TODO remove replacement/injection bodges and rename testQuery to something proper
            const result = await engine.query(newQ, {
                sources: [{type: 'sparql', value: this.endpoint.value}], //TODO unbodge
                initialBindings: new (Bindings as any)({
                    '?pointNE': factory.literal(`Point(${area.ne.lng},${area.ne.lat})`, new NamedNode('http://www.opengis.net/ont/geosparql#wktLiteral')),
                    '?pointSW': factory.literal(`Point(${area.sw.lng},${area.sw.lat})`, new NamedNode('http://www.opengis.net/ont/geosparql#wktLiteral')),
/*                    '?included': '{wd:Q12280 wd:Q811979 wd:Q3947}',
                    'excluded': '',
                    'limit': 100,
                    'language' : 'en'*/
                })
            })

            const collection: FeatureCollection<Geometry, GeoEntity> = {
                type: 'FeatureCollection',
                features: []
            }

            if (result.type == 'bindings') {
                return new Promise(( (resolve, reject) => {
                    // When each item is complete process it and add to collection
                    // This is faster than awaiting the entire result set.
                    result.bindingsStream.on('data', b => {
                        collection.features.push(asFeature({
                            id: 'not implemented (from WikiDataPlugin.ts',
                            position: wktLiteralToLatLng(b.get('?subjectLocation').value),
                            category: {
                                name: b.get('?subjectTypeLabel').value,
                                id: 'not implemented (from WikiDataPlugin.ts',
                            },
                            //category: {name: b.get('?subjectTypeLabel').value},
                            name: b.get('?subjectLabel').value
                        }))
                    });

                    // We can resolve once all results have been read.
                    result.bindingsStream.on('end', () => {
                        AppServices.notificationStore.pushNotification({
                            title: 'Map updated!',
                            description: `Fetched ${collection.features.length} items from WikiData`,
                            type: NotificationType.TOAST
                        })
                        resolve(collection);
                    });

                    // And reject if something went wrong.
                    result.bindingsStream.on('error', (error) => {
                        console.error('WikiData retrieval failed: ' + error)
                        reject(error);
                    })
                }))
            }

            else return Promise.reject('Result type is not == bindings');

        },

        getAbstract(...items): Promise<GeoEntity[]> {
            return Promise.reject('not implemented');
        },


        getDetails(...items): Promise<DetailsEntity> {
            return Promise.reject('not implemented')
        }
    };
}