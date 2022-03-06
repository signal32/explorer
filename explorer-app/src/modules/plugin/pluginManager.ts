import {Services, services} from '@/modules/app/services';
import {Entity} from '@/modules/geo/entity';

export interface Plugin {
    initialise(services: Services): PluginConfig | void,
}

export interface PluginConfig {
    options: Map<string, string>,
}

const defaultPluginConfig: PluginConfig = {
    options: new Map<string, string>()
}


export function loadPlugins<C>(plugins: PluginConstructor<C>[]) {
/*    for (const plugin of plugins) {

    }*/
}

interface Test<C> {
    defineMethods: (plugins: PluginRunner<C>[]) => C
}

export class PluginService<Contract> {
    private plugins: PluginRunner<Contract>[] = [];
    public readonly methods: Contract;

    constructor(defineMethods: (plugins: PluginRunner<Contract>[]) => Contract) {
        this.methods = defineMethods(this.plugins);
    }

    public register(plugin: PluginRunner<Contract>) {
        this.plugins.push(plugin);
    }

}

export class PluginRunner<Contract> {
    private config: PluginConfig;
    public methods: Contract;

    constructor(constructor: PluginConstructor<Contract>) {
        this.config = constructor.init(services, this) || defaultPluginConfig;
        this.methods = constructor.defineMethods(this.config);
    }
}

interface PluginConstructor<C> {
    init(services: Services, instance: PluginRunner<C>): PluginConfig | void,
    defineMethods(config: PluginConfig): C,
}


//demo

interface Interface {
    recommendForEntity(entity: Entity, limit?: number): Promise<Entity[]>,
    similarity(first: Entity, second: Entity): Promise<number>,
}

const service = new PluginService((plugins) => {
    return {
        recommendForEntity(entity: Entity, limit?: number): Promise<Entity[]> {
            return Promise.resolve([]);
        },

        similarity(first: Entity, second: Entity): Promise<number> {
            return Promise.resolve(0);
        }
    }
})

const runner = new PluginRunner({
    init(services, instance) {
         service.register(instance);
    },
    defineMethods(config) {
        return {
            recommendForEntity(entity: Entity, limit?: number): Promise<Entity[]> {
                return Promise.resolve([]);
            },

            similarity(first: Entity, second: Entity): Promise<number> {
                return Promise.resolve(0);
            }
        }
    }
});

