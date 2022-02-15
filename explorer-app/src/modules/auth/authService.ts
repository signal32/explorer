import {pinia} from '@/main';
import User from '@/modules/auth/user';
import {getUserStore} from '@/modules/auth/userStore';
import {getNotificationStore} from '../app/notificationStore';
import {createAxios} from './setup';
import {NotificationType} from '../app/notification';

const API_URL = process.env.VUE_APP_EXPLORER_AUTH_API + "protocol/openid-connect/";
const LOGIN_PATH = "token/";
const LOGOUT_PATH = "logout/";
const REGISTER_PATH = "";
const INFO_PATH = 'userinfo/';

const CLIENT_ID = 'explorer-user-app';

// const instance = axios.create({
//     baseURL: API_URL,
//     timeout: 15000,
// }).interceptors.response.use;

const instance = createAxios({
    baseURL: API_URL,
    timeout: 1500
});

console.log(API_URL);

class AuthService {
    /**
     * Authenticate with the given user
     * @param user
     */
    public login(user: User): Promise<User> {
        const params = new URLSearchParams();
        params.append('client_id', CLIENT_ID);
        params.append('username', user?.username || '');
        params.append('password', user?.password || '');
        params.append('grant_type', 'password');

        return instance
            .post(LOGIN_PATH, params)
            .then(async res => {
                const token = res.data?.access_token;
                const refreshToken = res.data?.refresh_token;
                if (token) {
                    console.log(`Authentication success: Token = ${token}\nRefresh Token = ${refreshToken}`);
                    user = await this.userInfo(token)
                    const store = getUserStore(pinia);
                    store.setUser({ user, token, refreshToken, loggedIn: true});
                }
                return user;
            })
            .catch( err => {
                console.log(`Authentication failed: ${err}`);
                throw err;
            })
    }

    /**
     * Ends the current session
     */
    public logout() {
        const token = getUserStore().refreshToken;
        return instance
            .post(LOGOUT_PATH, `client_id=${CLIENT_ID}&refresh_token=${token}`)
            .then( res => {
                console.log("logged out");
                getUserStore().clearUser();
            })
            .catch( err => {
                console.log(`Logout failed: ${err}`)
                throw(err);
            })
    }

    /**
     * Request to register the given user
     * @param user
     */
    public register(user: User): Promise<User> {
        return instance
            .post(REGISTER_PATH, {username: user.username, email: user.email, password: user.password})
            .then( res => {
                console.log(`Registration success: ${res.data}`);
                return user;
            })
            .catch( err => {
                console.log(`Registration failed: ${err}`);
                throw err;
            })
    }

    public async userInfo(token: string): Promise<User> {
        return instance
            .post(INFO_PATH, `access_token=${token}`)
            .then( res => {
                console.log("Retrieved user info");
                return {username: res.data?.preferred_username, email: res.data?.email}
                //return new User(res.data?.preferred_username, res.data?.email, '', '');
            })
            .catch( err => {
                console.log(`Error loading user info: ${err} `);
                return {};
            })
    }

    public refreshLogin(){
        const store = getUserStore();
        console.log("refreshing token");
        const params = new URLSearchParams();
        params.append('client_id', CLIENT_ID);
        //params.append('username', store.user?.username || '');
        params.append('refresh_token', store.refreshToken || '');
        params.append('grant_type', 'refresh_token');

        return instance
            .post(LOGIN_PATH, params)
            .then(async res => {
                const token = res.data?.access_token;
                const refreshToken = res.data?.refresh_token;
                if (token) {
                    console.log(`Re-authentication success: Token = ${token}\nRefresh Token = ${refreshToken}`);
                    const user = await this.userInfo(token)
                    const store = getUserStore(pinia);
                    store.refreshToken = refreshToken
                    store.setUser({ user: user, token, refreshToken, loggedIn: true});
                    return user;
                }
                else return {};
            })
            .catch( err => {
                console.log(`Re-authentication failed: ${err}`);
                getNotificationStore().pushNotification({title: "Authentication failed", type: NotificationType.TOAST});
                throw err;
            })

    }
}

export default new AuthService();