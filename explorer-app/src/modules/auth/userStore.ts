import {defineStore} from 'pinia';
import User from '@/modules/auth/user';

interface UserStoreState {
    loggedIn: boolean
    user?: User,
    token?: string,
    refreshToken?: string,
}

const defaultState:UserStoreState = {
    loggedIn: false,
    user: undefined,
    token: undefined,
    refreshToken: undefined
}

export const getUserStore = defineStore('userStore', {
    state: () => (defaultState),

    getters: {
    },

    actions: {
        setUser(user: UserStoreState) {
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