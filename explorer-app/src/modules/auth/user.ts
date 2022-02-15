export default interface User {
    username?: string;
    email?: string;
    password?: string;
    fName?: string;
    lName?: string;
}

export const defaultUser:User = {
    username: "Guest",
}