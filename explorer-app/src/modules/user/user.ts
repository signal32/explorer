export default class User {

    public username: string;
    public email: string;
    public password?: string;
    public roles: any;


    constructor(username = 'Guest', email = '', password = '', roles: any = undefined) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.roles = roles;
    }
}

// export default interface User {
//     username?: string;
//     email?: string;
//     password?: string;
//     fName?: string;
//     lName?: string;
// }