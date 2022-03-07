import {reactive, readonly } from 'vue';
import {UserService} from '@/modules/auth/userService';

// eslint-disable-next-line
export abstract class Store<T extends Object> {
    protected state: T;

    constructor() {
        const data = this.data();
        //this.setup(data);
        this.state = reactive(data) as T;
    }

    protected abstract data(): T

    //protected setup(data: T): void {}

    public getState(): T {
        return readonly(this.state) as T;
    }
}

/*
export function defineStore<S extends Object, M, T extends S & M>(state: S, defineMethods: (state: S) => M): T {

    const reactiveState = reactive(state) as S;
    const methods = defineMethods(reactiveState);
    return {...state, ...methods} as T;

}

export function defineStore2<T extends S & M, S extends Object, M>(state: S, defineMethods: (state: S) => M): T {

    const reactiveState = reactive(state) as S;
    const methods = defineMethods(reactiveState);
    return {...state, ...methods} as T;

}*/
