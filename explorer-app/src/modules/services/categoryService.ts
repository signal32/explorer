import {CategoryEntity} from '@/modules/geo/entity';
import {PluginService} from '@/modules/plugin/pluginManager';

/**
 * A Category BasePlugin provides a set of categories which can be
 * applied to a {@link CategoryEntity}.
 */
export interface CategoryService {

    /**
     * Return all the categories which may be represented.
     */
    getCategoryList(): Promise<CategoryEntity[]>,

    /**
     * Get all {@link CategoryEntity} which matches the search term.
     * The search technique may vary depending on concrete implementation.
     * @param term The search term
     */
    searchCategoryLabels(term: string): Promise<CategoryEntity[]>,

    /**
     * Get a list of categories that exactly match the provided label.
     * For partial matches consider using {@link searchCategoryLabels}
     * @param labels Labels to match against.
     */
    getCategoryFromLabel(labels: string[]): Promise<CategoryEntity[]>,
}

function defineCategoryService() {
    return new PluginService<CategoryService>(plugins => {
        return {
            async getCategoryFromLabel(labels: string[]): Promise<CategoryEntity[]> {
                const entities: CategoryEntity[] = [];
                for (const p of plugins) {
                    entities.push(... await p.getCategoryFromLabel(labels))
                }
                return entities;
            },

            async getCategoryList(): Promise<CategoryEntity[]> {
                const entities: CategoryEntity[] = [];
                for (const p of plugins) {
                    entities.push(... await p.getCategoryList())
                }
                return entities;
            },

            async searchCategoryLabels(term: string): Promise<CategoryEntity[]> {
                const entities: CategoryEntity[] = [];
                for (const p of plugins) {
                    entities.push(... await p.searchCategoryLabels(term))
                }
                return entities;
            }
        }
    })
}

export const categoryService = defineCategoryService();
