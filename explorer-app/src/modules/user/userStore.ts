import {defineStore} from 'pinia';
import User from '@/modules/user/user';

interface UserStoreState {
    user?: User,
    token?: string
}

export const getUserStore = defineStore('userStore', {
    state: () => ({
    } as UserStoreState),

    getters: {
    },

    actions: {
        setUser(user: User, token: string) {
            this.user = user;
            this.token = token;
        },
        clearUser() {
            this.user = undefined;
            this.token = undefined;
        }
    }
})