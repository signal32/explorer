import User from '@/modules/auth/user';
import {reactive} from 'vue';

/**
 * Structure of a store which contains core {@link User} and authentication information.
 */

export interface UserService {
    userState: UserState,
    setUser(user: UserState): any,
    clearUser(): any,
}

interface UserState {
    loggedIn: boolean
    user?: User,
    token?: string,
    refreshToken?: string,
}


const defaultState: UserState = {
    loggedIn: false,
    user: undefined,
    token: undefined,
    refreshToken: undefined
}

function defineUserService(): UserService {
    return reactive<UserService>({
        userState: defaultState,

        setUser(user: UserState): any {
            console.log("setting user:", user);
            this.userState.loggedIn = user.loggedIn;
            this.userState.user = user.user;
            this.userState.token = user.token;
            this.userState.refreshToken = user.refreshToken;
        },

        clearUser(): any {
            this.userState = defaultState;
        }
    });
}

export const userService = defineUserService();

