import {Storage} from '@ionic/storage';

/**
 * Hacky method to create a new store while avoiding top level await.
 * There is probably a better way of doing this!
 */
function createStore(): Storage {
    let store = new Storage();
    store.create().then(res => store = res);
    return store;
}

/**
 * Singleton instance of an ionic key-value store.
 */
export const useStore = createStore();
