import {Entity, EntityId} from '@/modules/geo/entity';
import {clamp} from 'lodash';
import {reactive} from 'vue';
import {services} from '@/modules/app/services';
import {useStore} from '@/modules/app/storage';

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
    const service: EntityPreferencesService = reactive({
        ratingMap: new Map<string, EntityRating>(),
        likedThreshold: 0.5,
        likeBonus: 0.1,
        likeDecayFactor: 0.5,
        liked: [],
        disliked: [],
        hash(): string {return JSON.stringify(this.ratingMap);},
        like(entity): any{
            if (entity.category) {
                this.nudge(entity.category, this.likeBonus, 0)
            }
            this.ratingMap.set(entity.id, {entity, value: 1});
            update(this);
        },
        dislike(entity): any {
            if (entity.category) {
                this.nudge(entity.category, -this.likeBonus, 0)
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
    });
    load().then(r => {
        service.ratingMap = r;
        update(service);
    });
    return service;
}

function update(state: EntityPreferencesService) {
    disliked(state);
    liked(state);
    save(state);
    services.debug.setDiagnosticData({
        scope: 'Preferences',
        name: 'Preference map',
        type: 'map',
        values: state.ratingMap,
    })
}

function save(state: EntityPreferencesService) {
    const serialisedMap = JSON.parse(JSON.stringify(Array.from(state.ratingMap.entries())));
    services.store.set('entity_preferences', serialisedMap);
}

async function load(): Promise<Map<string, EntityRating>> {
    const serialisedMap = await useStore.get('entity_preferences') as unknown as  [string, EntityRating][];
    return new Map(serialisedMap);
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
