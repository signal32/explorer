export default class User {

    public username: string;
    public email: string;
    public password?: string;
    public roles: any;


    constructor(username = 'NAN', email = '', password = '', roles: any = undefined) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.roles = roles;
    }
}