import {Entity, EntityId} from '@/modules/geo/entity';
import {clamp} from 'lodash';
import {reactive} from 'vue';
import {services} from '@/modules/app/services';

/**
 * Defines structure of a store containing preferences for an {@link Entity}.
 * This is most commonly used to rate entities that represent a category.
 */
export  interface EntityPreferencesService {
    ratingMap: Map<EntityId, EntityRating>,
    liked: EntityRating[],
    disliked: EntityRating[]
    likedThreshold: number,
    likeBonus: number,
    likeDecayFactor: number,
    like: (entity: Entity) => void,
    dislike: (entity: Entity) => void,
    forget: (entity: Entity) => void,
    nudge: (entity: Entity, delta: number, count: number) => void,
    hash: () => string
}

export interface EntityRating {
    entity: Entity,
    value: number,
}

function defineEntityPreferencesService(): EntityPreferencesService {
    return reactive({
        ratingMap: new Map<string, EntityRating>(),
        likedThreshold: 0.5,
        likeBonus: 0.1,
        likeDecayFactor: 0.5,
        liked: [],
        disliked: [],
        hash(): string {return JSON.stringify(this.ratingMap);},
        like(entity): any{
            if (entity.category) {
                this.nudge(entity.category, this.likeBonus)
            }
            this.ratingMap.set(entity.id, {entity, value: 1});
            update(this);
        },
        dislike(entity): any {
            console.log('dislike')
            if (entity.category) {
                this.nudge(entity.category, -this.likeBonus)
            }
            this.ratingMap.set(entity.id, {entity, value: 0})
            update(this);
        },
        forget(entity): any {
            this.ratingMap.delete(entity.id);
            update(this);
        },
        nudge(entity, delta, count= 0) {
            const entry = this.ratingMap.get(entity.name);
            if (entry) entry.value += delta;
            else this.ratingMap.set(entity.id, {entity, value: clamp(this.likedThreshold + delta, 0, 1)})

            if (entity.category && count < 10) {
                this.nudge(entity.category, delta * this.likeDecayFactor, count + 1)
            }
            update(this);
        }
    })
}

function update(state: EntityPreferencesService) {
    disliked(state);
    liked(state);
    services.debug.setDiagnosticData({
        scope: 'Preferences',
        name: 'Preference map',
        type: 'map',
        values: state.ratingMap,
    })
}

function disliked(state: EntityPreferencesService) {
    const entities: EntityRating[] = [];
    state.ratingMap.forEach((rating) => {
        if (rating.value < state.likedThreshold) entities.push(rating);
    })
    state.disliked = entities;
}

function liked(state: EntityPreferencesService) {
    const entities: EntityRating[] = [];
    state.ratingMap.forEach((rating) => {
        if (rating.value >= state.likedThreshold) entities.push(rating);
    })
    state.liked = entities;
}

export const entityPreferenceService = defineEntityPreferencesService();
