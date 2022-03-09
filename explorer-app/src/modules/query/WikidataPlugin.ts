import {QueryService} from '@/modules/query/queryService';
import {Bindings} from '@comunica/bus-query-operation';
import {DataFactory, NamedNode} from 'rdf-data-factory';
import {newEngine} from '@comunica/actor-init-sparql';
import {LatLng, LatLngBounds} from '@/modules/geo/types';
import {Feature, FeatureCollection, Geometry} from 'geojson';
import {GeoEntity, DetailsEntity, CategoryEntity} from '@/modules/geo/entity';
import testQuery from './sparql/testQuery.sparql';
import {Index} from 'flexsearch';
import selectCategories from './sparql/selectCategories.sparql';
import {NotificationType} from '@/modules/app/notification';
import {Plugin, PluginParam} from '@/modules/plugin/pluginManager';
import {Services} from '@/modules/app/services';
import {CategoryService} from '@/modules/app/categoryService';

const engine = newEngine();
const factory = new DataFactory();

const DEFAULT_LIKED = 'wd:Q12280 wd:Q811979 wd:Q3947';
const DEFAULT_DISLIKED = 'wd:Q13276'

const defaultEndpoint = {
    name: 'SPARQL Endpoint',
    value: 'https://query.wikidata.org/sparql',
    default: 'https://query.wikidata.org/sparql',
}

class WikiDataPlugin implements QueryService, CategoryService, Plugin {

    private readonly categoryStorageKey = 'categories_cache';
    private categories: CategoryEntity[] = [];
    private index?: Index;

    constructor(private services?: Services, private endpoint: PluginParam = defaultEndpoint) {}

    initialise(services: Services) {
        this.services = services;
        this.endpoint = defaultEndpoint;

        services.queryService.register(this);
        services.categoryService.register(this);

        this.getCategoryList().then(result => this.categories = result);

        return {
            metadata: {
                name: 'WikiData'
            },
            configVariables: () => [this.endpoint]
        };
    }

    getAbstract(...items: [string]): Promise<GeoEntity[]> {
        console.warn('getAbstract() not implemented for WikiDataPlugin');
        return Promise.resolve([]);
    }

    /**
     * Searches WikiData for items within an area and returns them as {@link GeoEntity}.
     * @param area The area to search
     */
    async getAbstractArea(area: LatLngBounds): Promise<FeatureCollection<Geometry, GeoEntity>> {

        const query = testQuery
            .replace('?@include', this.computeIncluded())
            .replace('?@exclude', this.computeExcluded())

        const result = await engine.query(query, {
            sources: [{type: 'sparql', value: this.endpoint.value}],
            initialBindings: new (Bindings as any)({
                '?pointNE': factory.literal(`Point(${area.ne.lng},${area.ne.lat})`, new NamedNode('http://www.opengis.net/ont/geosparql#wktLiteral')),
                '?pointSW': factory.literal(`Point(${area.sw.lng},${area.sw.lat})`, new NamedNode('http://www.opengis.net/ont/geosparql#wktLiteral')),
            })
        });

        const features: FeatureCollection<Geometry, GeoEntity> = {
            type: 'FeatureCollection',
            features: []
        }

        if (result.type == 'bindings') {
            return new Promise((resolve, reject) => {
                // When each item is complete process it and add to collection
                // This is faster than awaiting the entire result set.
                result.bindingsStream.on('data', b => {
                    features.features.push(asFeature({
                        id: wikidataIdFromUrl(b.get('?subject').value),
                        position: wktLiteralToLatLng(b.get('?subjectLocation').value),
                        category: {
                            name: b.get('?subjectTypeLabel').value,
                            id: 'not implemented (from WikiDataPlugin.ts',
                        },
                        //category: {name: b.get('?subjectTypeLabel').value},
                        name: b.get('?subjectLabel').value
                    }))
                });

                // Resolve once all results have been read.
                result.bindingsStream.on('end', () => {
                    this.services?.notificationService.pushNotification({
                        title: 'Map updated!',
                        description: `Fetched ${features.features.length} items from WikiData`,
                        type: NotificationType.TOAST
                    })
                    resolve(features);
                });

                // And reject if something went wrong.
                result.bindingsStream.on('error', (error) => {
                    console.error('WikiData retrieval failed: ' + error)
                    reject(error);
                })

            })
        }

        else return Promise.reject('Result type is not bindings');
    }

    getCategoryFromLabel(labels: string[]): Promise<CategoryEntity[]> {
        console.warn('getCategoryFromLabel() not implemented for WikiDataPlugin');
        return Promise.resolve([]);
    }

    async getCategoryList(): Promise<CategoryEntity[]> {
        if (this.categories.length == 0) {
            this.categories = await this.loadCategories();
        }
        return this.categories;
    }

    async getDetails(...items: [string]): Promise<DetailsEntity> {
        return Promise.reject('Not implemented');
    }

    async searchCategoryLabels(term: string): Promise<CategoryEntity[]> {
        if (!this.index) await this.setupCategoryIndex();

        const ids = this.index?.search(term, 10) || [];
        const names = this.categories.filter(c => ids.includes(c.id)); // HACK This will be slow!
        return Promise.resolve(names);
    }

    /**
     * Hack method to get list of IDs suitable for injecting into SPARQL
     * @private
     */
    private computeIncluded(): string {
        let included = '';
        if (this.services && this.services.preferenceService.liked.length > 0) {
            this.services.preferenceService.liked.forEach( liked => {
                included += (`wd:${liked.entity.id} `);
            })
        }
        else included = DEFAULT_LIKED;
        return included;
    }

    /**
     * Hack method to get list of IDs suitable for injecting into SPARQL
     * @private
     */
    private computeExcluded(): string {
        let excluded = '';
        if (this.services && this.services.preferenceService.disliked.length > 0) {
            this.services.preferenceService.disliked.forEach( disliked => {
                excluded += (`wd:${disliked.entity.id} `);
            })
        }
        else excluded = DEFAULT_DISLIKED;
        return excluded;
    }

    /**
     * Loads categories. No side effects, you must assign returned categories yourself.
     * @private
     */
    private async loadCategories(): Promise<CategoryEntity[]> {
        let newCategories = await this.services?.store.get(this.categoryStorageKey) as CategoryEntity[];

        if (newCategories) {
            return Promise.resolve(newCategories);
        }
        else {
            console.log('Loading categories from WikiData');
            newCategories = [];

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
                       newCategories.push(category);
                    });

                    // Should wait and be resolved only when all bindings have been processed
                    result.bindingsStream.on('end', () => {
                        this.services?.store.set(this.categoryStorageKey, newCategories)
                        resolve(newCategories);
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
    }

    private async setupCategoryIndex() {
        this.index = new Index({
            charset: 'latin:extra',
            preset: 'match',
            tokenize: 'strict',
            cache: false,
        });

        this.categories.forEach(c => {
            this.index?.add(c.id, c.name);
        })
    }

}

export const wikidataPlugin  = new WikiDataPlugin();

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
