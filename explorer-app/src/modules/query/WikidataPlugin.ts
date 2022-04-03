import {QueryService} from '@/modules/query/queryService';
import {DataFactory, NamedNode} from 'rdf-data-factory';
import {newEngine} from '@comunica/actor-init-sparql';
import {LatLng, LatLngBounds} from '@/modules/geo/types';
import {FeatureCollection, Geometry} from 'geojson';
import {GeoEntity, CategoryEntity, Entity} from '@/modules/geo/entity';
import describeItems from './sparql/describeItems.sparql';
import {Index} from 'flexsearch';
import selectCategories from './sparql/selectCategories.sparql';
import {Plugin, PluginConfig} from '@/modules/plugin/pluginManager';
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
import {
    getArea, getAreaNamed, getCategories, getEntity,
    getGeoEntity, getLocation, getSimilarByCategory, WikiDataId
} from '@/modules/query/queryAbstractionLayer';
import {toGeoJsonFeature} from '@/modules/geo/geoJson';

const engine = newEngine();

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
       const ids = await getSimilarByCategory([entity.id as WikiDataId], this.endpoint);

       // Do not recommend the original entity
       const entityIdx = ids.indexOf(entity.id as WikiDataId);
       if (entityIdx >= 0) ids.splice(entityIdx, 1);

       return getEntity(ids, this.endpoint);
   }

    /**
     * Not implemented for WikiData plugin as this is hard to calculate
     * with using only a WikiData endpoint. See separate WikiData Recommend Plugin.
     */
    similarity(first: Entity, second: Entity): Promise<number> {
        return Promise.reject('not implemented');
    }

    async getById(id: string): Promise<GeoEntity | undefined> {

        const entities = await getGeoEntity([id as WikiDataId], this.endpoint);
        return entities[0] || undefined;
    }

    /**
     * Searches WikiData for items within an area and returns them as {@link GeoEntity}.
     * @param area The area to search
     * @param categories Categories to include for this search only.
     * @param name Name of entity to find
     */
    async getByArea(area: LatLngBounds, categories?: CategoryEntity[], name?: string): Promise<FeatureCollection<Geometry, GeoEntity>> {

        const entityIds = (name)
            ? await getAreaNamed(area, name, [this.computeIncluded(categories) as WikiDataId], [this.computeExcluded() as WikiDataId], this.endpoint)
            : await getArea(area, [this.computeIncluded(categories) as WikiDataId], [this.computeExcluded() as WikiDataId], this.endpoint)

        const entities = await getGeoEntity(entityIds, this.endpoint);

        const collection: FeatureCollection<Geometry, GeoEntity> = {
            type: 'FeatureCollection',
            features: entities.map(toGeoJsonFeature),
        }

        return collection;
    }

    async getbyLocation(location: GeoEntity): Promise<GeoEntity[]> {
        const ids = await getLocation([location.id as WikiDataId], [this.computeIncluded() as WikiDataId], [this.computeExcluded() as WikiDataId], this.endpoint);
        return getGeoEntity(ids, this.endpoint);
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
        const query = describeItems.replace('?items', entity.id);
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
            categories.forEach(category => {included += (`${category.id} `)})
        }
        else if (this.services && this.services.preferenceService.liked.length > 0) {
            this.services.preferenceService.liked.forEach( liked => {
                included += (`${liked.entity.id} `);
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
                excluded += (`${disliked.entity.id} `);
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
            newCategories = await getCategories(this.endpoint);
            this.services?.store.set(this.categoryStorageKey, newCategories);
            return newCategories;
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
