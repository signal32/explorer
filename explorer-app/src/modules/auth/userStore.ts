import {defineStore} from 'pinia';
import User from '@/modules/auth/user';

/**
 * Structure of a store which contains core {@link User} and authentication information.
 */
/*interface UserStoreState {
    loggedIn: boolean
    user?: User,
    token?: string,
    refreshToken?: string,
}*/

const defaultState:UserState = {
    loggedIn: false,
    user: undefined,
    token: undefined,
    refreshToken: undefined
}

/**
 * Singleton instance of {@link UserStoreState}.
 */
export const getUserStore = defineStore('userStore', {
    state: () => (defaultState),

    getters: {
    },

    actions: {
        setUser(user: UserState) {
            this.loggedIn = user.loggedIn
            this.user = user.user;
            this.token = user.token;
            this.refreshToken = user.refreshToken;
        },
        clearUser() {
            this.user = undefined;
            this.token = "none";
            this.loggedIn = false;
            this.refreshToken = "none";
        }
    }
})

interface UserState {
    loggedIn: boolean
    user?: User,
    token?: string,
    refreshToken?: string,
}

export interface UserService {
    userState: UserState,
    setUser(user: UserState): any,
    clearUser(): any
}

export function getUserService(): UserService {
    return {
        userState: getUserStore().$state,
        clearUser: getUserStore().clearUser,
        setUser: getUserStore().setUser
    }
}