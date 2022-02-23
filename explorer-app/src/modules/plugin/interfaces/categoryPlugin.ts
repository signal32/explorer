import {CategoryEntity} from '@/modules/geo/entity';

/**
 * A Category Plugin provides a set of categories which can be
 * applied to a {@link CategoryEntity}.
 */
export interface CategoryPlugin {

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