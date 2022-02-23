import {defineStore} from 'pinia';
import {Entity, EntityId} from '@/modules/geo/entity';
import {clamp} from 'lodash';

/**
 * Defines structure of a store containing preferences for an {@link Entity}.
 * This is most commonly used to rate entities that represent a category.
 */
interface EntityPreferencesStore {
    ratingMap: Map<EntityId, EntityRating>,
    likedThreshold: number,
    likeBonus: number,
    likeDecayFactor: number,
}

const defaultState: EntityPreferencesStore = {
    ratingMap: new Map<string, EntityRating>(),
    likedThreshold: 0.5,
    likeBonus: 0.1,
    likeDecayFactor: 0.5,
}

export interface EntityRating {
    entity: Entity,
    value: number,
}

/**
 * Singleton instance of {@link EntityPreferencesStore}.
 * This is most commonly used to rate entities that represent a category.
 * Each {@link Entity} is wrapped within an {@link EntityRating} and assigned
 * a value between 0 & 1 where 0 is 'disliked' and 1 is 'liked'.
 */
export const getUserPreferencesStore = defineStore('userPreferencesStore', {
    state: () => defaultState,

    getters: {

        /**
         * Get the entities with a rating above {@link EntityPreferencesStore#likedThreshold}, (aka liked).
         */
        liked: state => {
            const entities: EntityRating[] = [];
            state.ratingMap.forEach((rating) => {
                if (rating.value >= state.likedThreshold) entities.push(rating);
            })
            return entities;
        },

        /**
         * Get the entities with a rating below {@link EntityPreferencesStore#likedThreshold}, (aka disliked).
         */
        disliked: state => {
            const entities: EntityRating[] = [];
            state.ratingMap.forEach((rating) => {
                if (rating.value <= state.likedThreshold) entities.push(rating);
            })
            return entities;
        }
    },

    actions: {

        /**
         * Sets entity as liked by setting its rating ({@link EntityRating#value}) to 1.
         * @param entity The entity to like.
         */
        like(entity: Entity) {
            if (entity.category) {
                this.nudge(entity.category, this.likeBonus)
            }
            this.ratingMap.set(entity.id, {entity, value: 1});
        },

        /**
         * Sets entity as disliked by setting its rating ({@link EntityRating#value}) to 0.
         * @param entity The entity to dislike.
         */
        dislike(entity: Entity) {
            console.log('dislike')
            if (entity.category) {
                this.nudge(entity.category, -this.likeBonus)
            }
            this.ratingMap.set(entity.id, {entity, value: 0})
        },

        /**
         * Remove an entity from the store with the effect that there is
         * now no preference attributed to it.
         * @param entity the entity to forget.
         */
        forget(entity: Entity) {
            this.ratingMap.delete(entity.id);
        },

        /**
         * Increment an entities rating by the given delta amount.
         * Will also adjust the entities {@link Entity#category} rating by a factor {@link EntityPreferencesStore#likeDecayFactor} of delta.
         * @param entity The entity to nudge
         * @param delta Amount to increase/decrease rating
         * @param count Used to prevent internal excessive recursion. Leave as default unless using recursively.
         */
        nudge(entity: Entity, delta: number, count = 0) {
            const entry = this.ratingMap.get(entity.name);
            if (entry) entry.value += delta;
            else this.ratingMap.set(entity.id, {entity, value: clamp(this.likedThreshold + delta, 0, 1)})

            if (entity.category && count < 10) {
                this.nudge(entity.category, delta * this.likeDecayFactor, count + 1)
            }
        },
    },
})