import axios from 'axios';
import {pinia} from '@/main';
import User from '@/modules/user/user';
import {getUserStore} from '@/modules/user/userStore';

const API_URL = process.env.VUE_APP_EXPLORER_AUTH_API;
const LOGIN_PATH = "token/";
const LOGOUT_PATH = "logout/";
const REGISTER_PATH = "";
const INFO_PATH = 'userinfo/';


const instance = axios.create({
    baseURL: API_URL,
    timeout: 15000,
});

console.log(API_URL);

class AuthService {
    /**
     * Authenticate with the given user
     * @param user
     */
    public login(user: User): Promise<User> {
        const params = new URLSearchParams();
        params.append('client_id', 'explorer-user-app');
        params.append('username', user.username);
        params.append('password', user.password ? user.password : '');
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
                    store.setUser(user, token);
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
        const token = getUserStore().token;
        return instance
            .post(LOGOUT_PATH, `access_token=${token}`)
            .then( res => {
                console.log("logged out");
                getUserStore().clearUser();
            })
            .catch( err => {
                console.log(`Logout failed: ${err}`)
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
                return new User(res.data?.preferred_username, res.data?.email, '', '');
            })
            .catch( err => {
                console.log(`Error loading user info: ${err} `);
                return new User();
            })
    }
}

export default new AuthService();