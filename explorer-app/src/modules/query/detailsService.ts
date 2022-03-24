import {Entity} from '@/modules/geo/entity';
import {PluginService} from '@/modules/plugin/pluginManager';
import {Quad} from '@rdfjs/types';

/**
 * Provides structured detailed information for {@link Entity} instances.
 *
 * Plugins can be registered that implement {@link DetailServiceKnowledgePlugin} to provide information
 * and {@link DetailServiceFormatPlugin} to format this data for internal processing and display.
 */
export interface DetailService {
    /**
     * Knowledge provider plugin host service
     */
    knowledge: PluginService<DetailServiceKnowledgePlugin>,

    /**
     * Knowledge formatter plugin host service
     */
    format: PluginService<DetailServiceFormatPlugin>,

    /**
     * Query for a list of details about an entity.
     * @param entity Subject entity of get details query.
     */
    getDetails(entity: Entity): Promise<DetailElement[]>
}

/**
 * Interface for plugins which can describe an {@link Entity} in RDF terms.
 */
export interface DetailServiceKnowledgePlugin {

    /**
     * Describe an entity in RDF terms, i.e. a bag of subject, predicate, object triples.
     * @param entity Entity to describe
     */
    describe: (entity: Entity) => Promise<Quad[]>,
}

/**
 * Interface for plugins with can format abstract knowledge into a format for presentation.
 */
export interface DetailServiceFormatPlugin {
    /**
     * Format information about an entity into a presentation format.
     * @param entity
     * @param knowledge
     */
    format: (entity: Entity, knowledge: Quad[]) => Promise<DetailElement[]>,
}

/**
 * Describes an {@link Entity} in a format designed for presentation.
 */
export declare type DetailElement = ImageDetailElement | TextDetailElement | ActionDetailElement | SectionDetailElement | PropertyDetailElement;

interface BaseDetailElement {
    type: 'images' | 'text' | 'actions' | 'section' | 'properties',
    id: string,
    order?: number,
}

/**
 * List of one or more image elements.
 */
export interface ImageDetailElement extends BaseDetailElement {
    type: 'images'
    images: { url: string, caption?: string, attribution?: string }[]
}

/**
 * Text description.
 */
export interface TextDetailElement extends BaseDetailElement {
    type: 'text',
    title: string,
    body: string
}

/**
 * Internal or external action.
 */
export interface ActionDetailElement extends BaseDetailElement {
    type: 'actions',
    actions: { title: string, url: string, exec?: () => DetailElement }[]
}

/**
 * Simple bag of properties.
 */
export interface PropertyDetailElement extends BaseDetailElement {
    type: 'properties',
    properties: {name: string, values: string[]}[]
}

/**
 * Recursive container for other {@link DetailElement} implementation.
 */
export interface SectionDetailElement extends BaseDetailElement {
    type: 'section'
    title: string,
    subtitle?: string,
    elements: DetailElement[]
}

/**
 * Create a new {@link DetailService} instance.
 */
export function defineDetailService(): DetailService {
    return {
        knowledge: new PluginService<DetailServiceKnowledgePlugin>(plugins => {
            return {
                async describe(entity): Promise<Quad[]> {
                    const details: Quad[] = [];
                    for (const p of plugins) {
                        const pDetails = await p.describe(entity);
                        details.push(...pDetails);
                    }
                    return details;
                }
            }
        }),
        format : new PluginService<DetailServiceFormatPlugin>(plugins => {
            return {
                async format(entity, knowledge): Promise<DetailElement[]> {
                    const details: DetailElement[] = [];
                    for (const p of plugins) {
                        const pDetails = await p.format(entity, knowledge);
                        details.push(...pDetails);
                    }
                    return details;
                }
            }
        }),

        async getDetails(entity: Entity): Promise<DetailElement[]> {
            const k = await this.knowledge.methods.describe(entity);
            return this.format.methods.format(entity, k);
        }
    }
}
