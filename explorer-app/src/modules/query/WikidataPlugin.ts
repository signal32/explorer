import {QueryService} from '@/modules/query/queryService';
import {Bindings} from '@comunica/bus-query-operation';
import {DataFactory, NamedNode} from 'rdf-data-factory';
import {newEngine} from '@comunica/actor-init-sparql';
import {LatLng, LatLngBounds} from '@/modules/geo/types';
import {Feature, FeatureCollection, Geometry} from 'geojson';
import {GeoEntity, DetailsEntity, CategoryEntity, Entity} from '@/modules/geo/entity';
import testQuery from './sparql/testQuery.sparql';
import describeItems from './sparql/describeItems.sparql';
import {Index} from 'flexsearch';
import selectCategories from './sparql/selectCategories.sparql';
import selectEntityById from './sparql/selectEntityById.sparql';
import recommendForEntity from './sparql/recommendForEntity.sparql';
import testQueryNamed from './sparql/testQueryNamed.sparql';
import {NotificationType} from '@/modules/app/notification';
import {Plugin, PluginConfig, PluginParam} from '@/modules/plugin/pluginManager';
import {Services} from '@/modules/app/services';
import {CategoryService} from '@/modules/app/categoryService';
import {
    ActionDetailElement,
    DetailElement,
    DetailServiceFormatPlugin,
    DetailServiceKnowledgePlugin, ImageDetailElement
} from '@/modules/query/detailsService';
import {Quad} from '@rdfjs/types';
import {RecommendService} from '@/modules/app/recommendationService';

const engine = newEngine();
const factory = new DataFactory();

const DEFAULT_LIKED = 'wd:Q12280 wd:Q811979 wd:Q3947';
const DEFAULT_DISLIKED = 'wd:Q13276'
const DEFAULT_ENDPOINT = 'https://query.wikidata.org/sparql';


export class WikiDataPlugin implements QueryService, CategoryService, DetailServiceKnowledgePlugin, DetailServiceFormatPlugin, RecommendService, Plugin {

    private readonly categoryStorageKey = 'categories_cache';
    private categories: CategoryEntity[] = [];
    private index?: Index;

    constructor(private services?: Services, private endpoint: string = DEFAULT_ENDPOINT) {}

    initialise(services: Services): PluginConfig {
        this.services = services;

        this.getCategoryList().then(result => this.categories = result);

        return {
            metadata: {
                name: 'WikiData'
            },
            //configVariables: () => [this.endpoint]
            params: [
                {
                    name: 'SPARQL Endpoint',
                    type: 'string',
                    default: 'https://query.wikidata.org/sparql',
                    get: () => {return this.endpoint},
                    set: value => {this.endpoint = value}
                }
            ],
            onEnable: () => {
                services.queryService.register(this);
                services.categoryService.register(this);
                services.detailService.knowledge.register(this);
                services.detailService.format.register(this);
                services.recommendationService.register(this);

            },
            onDisable: () => {
                services.queryService.remove(this);
                services.categoryService.remove(this);
                services.detailService.knowledge.remove(this);
                services.detailService.format.remove(this);
                services.recommendationService.remove(this);
            }
        };
    }

    /**
     * Get a list of similar entities to the supplied {@link Entity}.
     * Under the hood this method polls the WikiData SPARQL endpoint using {@link recommendForEntity}
     * to select entities within the same region and of same/adjacent categories.
     * @param entity Entity to find similar entities for
     * @param limit Max similar entities to find
     */
   async recommendForEntity(entity: Entity, limit?: number): Promise<Entity[]> {
       const query = recommendForEntity.replace(`?@originEntities`, `wd:${entity.id}`)
       const result = await engine.query(query, {sources: [{type: 'sparql', value: this.endpoint}]});

       const recommended: Entity[] = [];

       if (result.type == 'bindings') {
           return new Promise( (resolve, reject) => {
               // When each item is complete process it and add to collection
               // This is faster than awaiting the entire result set.
               result.bindingsStream.on('data', binding => {
                   if (wikidataIdFromUrl(binding.get('?subject').value) != entity.id){
                       recommended.push({
                           id: wikidataIdFromUrl(binding.get('?subject').value),
                           category: {
                               id: binding.get('?category').value,
                               name: binding.get('?categoryLabel').value,
                               iconUrl: binding.get('?categoryIcon')?.value,
                           },
                           name: binding.get('?subjectLabel').value,
                           thumbnailUrl: binding.get('?subjectImage')?.value
                       })
                   }
               })

               // Resolve once all results have been read.
               result.bindingsStream.on('end', () => {
                   resolve(recommended);
               });

               // And reject if something went wrong.
               result.bindingsStream.on('error', (error) => {
                   console.error('WikiData retrieval failed: ' + error)
                   reject(error);
               })
           })
       }

       return Promise.reject('Result type is not bindings')
   }

    /**
     * Not implemented for WikiData plugin as this is hard to calculate
     * with using only a WikiData endpoint. See separate WikiData Recommend Plugin.
     */
    similarity(first: Entity, second: Entity): Promise<number> {
        return Promise.reject('not implemented');
    }

    async getById(id: string): Promise<GeoEntity | undefined> {
        const query = selectEntityById.replace('?@ids', `wd:${id}`);

        const result = await engine.query(query, {sources: [{type: 'sparql', value: this.endpoint}]});

        if (result.type == 'bindings') {
            const binding = await result.bindings();
            if (binding.length > 0) {
                return {
                    id: wikidataIdFromUrl(binding[0].get('?subject').value),
                    name: binding[0].get('?subjectLabel').value,
                    position: wktLiteralToLatLng(binding[0].get('?subjectLocation').value),
                    category: {
                        id: wikidataIdFromUrl(binding[0].get('?category').value),
                        name: binding[0].get('?categoryLabel').value,
                        iconUrl: binding[0].get('?categoryIcon')?.value,
                    }
                }
            }
        }
        else return undefined;
    }

    /**
     * Searches WikiData for items within an area and returns them as {@link GeoEntity}.
     * @param area The area to search
     */
    async getByArea(area: LatLngBounds, categories?: CategoryEntity[], name?: string): Promise<FeatureCollection<Geometry, GeoEntity>> {
        let query: string;
        if (name) {
            query  = testQueryNamed
                .replace('?@include', this.computeIncluded(categories))
                .replace('?@exclude', this.computeExcluded())
                .replace('?@label', name);
        }

        else {
            query = testQuery
                .replace('?@include', this.computeIncluded(categories))
                .replace('?@exclude', this.computeExcluded())
        }

        const result = await engine.query(query, {
            sources: [{type: 'sparql', value: this.endpoint}],
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
                result.bindingsStream.on('data', binding => {
                    features.features.push(asFeature({
                        id: wikidataIdFromUrl(binding.get('?subject').value),
                        position: wktLiteralToLatLng(binding.get('?subjectLocation').value),
                        category: {
                            id: binding.get('?category').value,
                            name: binding.get('?categoryLabel').value,
                            iconUrl: binding.get('?categoryIcon')?.value,
                        },
                        name: binding.get('?subjectLabel').value
                    }))
                });

                // Resolve once all results have been read.
                result.bindingsStream.on('end', () => {
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

    async getbyLocation(location: GeoEntity): Promise<GeoEntity[]> {
        return [];
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

    async describe(entity: Entity): Promise<Quad[]> {
        const query = describeItems.replace('?items', `wd:${entity.id}`);
        const result = await engine.query(query, { sources: [{type: 'sparql', value: this.endpoint}]})
        if (result.type == 'quads') {
            return result.quads();
        }
        else return Promise.reject('Result type is not quad');
    }

    async format(entity: Entity, facts: Quad[]): Promise<DetailElement[]> {
        const details: DetailElement[] = [];

        const image: ImageDetailElement = {
            id: `${entity.id}_image`,
            type: 'images',
            images: [],
        };

        const actions: ActionDetailElement = {
            id: `${entity.id}_canmoreLink`,
                type: 'actions',
            actions: [{title: 'View on WikiData', url: `https://wikidata.org/wiki/${entity.id}/`}]
        }

        facts.forEach(fact => {

            // Images should have P18 property and a valid URL (a regex check would be better)
            if (wikidataIdFromUrl(fact.predicate.value, true) == 'P18' && fact.predicate.value.includes('http')) {
                image.images.push({
                    url: fact.object.value,
                    caption: fact.predicate.value
                })
            }

            if (wikidataIdFromUrl(fact.predicate.value, true) == 'P718') {
                actions.actions.push({title: 'View on Canmore', url: `https://canmore.org.uk/site/${fact.object.value}`})
            }
        })

        details.push(image);
        details.push(actions);
        return details;
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
    private computeIncluded(categories?: CategoryEntity[]): string {
        let included = '';
        if (categories) {
            categories.forEach(category => {included += (`wd:${category.id} `)})
        }
        else if (this.services && this.services.preferenceService.liked.length > 0) {
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
            console.debug(`Loading ${newCategories.length} categories from local cache`)
            return Promise.resolve(newCategories);
        }
        else {
            console.log('Loading categories from WikiData: Cached categories could not be loaded');
            newCategories = [];

            const result = await engine.query(selectCategories, {
                sources: [{type: 'sparql', value: this.endpoint}]
            });

            if (result.type == 'bindings') {
                return new Promise(((resolve, reject) => {
                    // Collect data from categories
                    result.bindingsStream.on('data', listener => {
                        const category = {
                            id: wikidataIdFromUrl(listener.get('?target').value),
                            name: listener.get('?label').value,
                            iconUrl: listener.get('?icon')?.value,
                        };
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

/**
 * Extract WikiData ID, e.g. P317, from a URL.
 * @param url Url of WikiData item. e.g. http://www.wikidata.org/prop/direct/P18
 * @param directOnly Only resolve IDs for URLs which point to linked data directly.
 */
function wikidataIdFromUrl(url: string, directOnly = false): string {
    if (directOnly && !url.includes('direct')) return '';
    const matches = url.match(/[Q|P]\d*/gm);
    if (matches) {
        return matches[0]
    }
    else return '';
}
