import {Services, services} from '@/modules/app/services';
import {Ref, WritableComputedRef} from 'vue';

export interface PluginManager {
    loadPlugin: (plugin: Plugin) => void,
    unloadPlugin: (name: string) => boolean,
    getPluginParams: (name: string) => PluginParam[],
    setPluginParam: (scope: string, param: PluginParam) => void,
    setPluginRemoveCallback: (name: string, cb: (name: string) => void) => void,
    getPluginConfigs: () => PluginConfig[],
}

export interface Plugin {
    initialise(services: Services): PluginConfig,
}

export interface PluginConfig {
    metadata: PluginMeta,
    params?: PluginParam[];
    onDisable?: (services: Services) => void,
    onEnable?: (services: Services) => void,
}

export interface BasePluginParam<T> {
    name: string,
    description?: string,
    type: 'number' | 'string' | 'boolean',
    default?: T,
    options?: T[],
    get: () => T,
    set?: (value: T) => void,
}

export interface NumberPluginParam extends BasePluginParam<number>{ type: 'number' }
export interface StringPluginParam extends BasePluginParam<string>{ type: 'string'}
export interface BooleanPluginParam extends BasePluginParam<boolean>{ type: 'boolean'}


export declare type PluginParam = NumberPluginParam | StringPluginParam | BooleanPluginParam;



interface PluginMeta {
    name: string,
    description?: string,
    version?: string
}

const storePluginPrefix = 'explorer-plugin-';


export class AppPluginManager implements PluginManager {

    private loadedPlugins = new Map<string, {instance: Plugin, config: PluginConfig, destroyCb: ((name: string) => void)[]}>();

    constructor(private services: Services) {
        console.log('Plugin Manager loaded with services:', services);
    }

    async loadPlugin(plugin: Plugin) {
        try{
            const config = plugin.initialise(this.services);
            await this.bindVariables(config);
            this.loadedPlugins.set(config.metadata.name, {instance: plugin, config, destroyCb: []});
            console.log(`Loaded plugin: name: ${config.metadata.name}, version: ${config.metadata.version || 'undefined'}`)
        }
        catch (e) {
            console.error('Plugin load failed for plugin: ', plugin);
        }
    }

    unloadPlugin(name: string): boolean {
        return false;
    }

    getPluginParams(name: string): PluginParam[] {
        if (name) {
            const config = this.loadedPlugins.get(name)?.config;
            return config?.params || [];
        }
        return [];
    }

    async setPluginParam(scope: string, param: PluginParam) {
        await this.services.store.set(storePluginPrefix + scope, param);

        // If the plugin is active then re-bind it's parameters so it 'sees' the new value
        const pluginConfig = this.loadedPlugins.get(scope)?.config;
        if (pluginConfig) {
            await this.bindVariables(pluginConfig);
        }
    }

    public setPluginRemoveCallback(name: string, cb: (name: string) => void) {
        this.loadedPlugins.get(name)?.destroyCb.push(cb);
    }

    public getPluginConfigs() {
        const configs: PluginConfig[] = []
        this.loadedPlugins.forEach(c => configs.push(c.config));
        return configs;
    }

    private async bindVariables(config: PluginConfig) {
        const params = config.params || [];
        for (const param of params) {
            const value = await this.services.store.get(storePluginPrefix + param.name) || param.default;
            if (value && param.type == 'string') param.set?.(value as string);
            if (value && param.type == 'number') param.set?.(value as number)
            if (value && param.type == 'boolean') param.set?.(value as boolean);
        }
    }
}

export class PluginService<Contract> {
    private plugins: (Contract & Plugin)[] = [];
    public readonly methods: Contract;

    constructor(defineMethods: (plugins: Contract[]) => Contract) {
        this.methods = defineMethods(this.plugins);
    }

    public register(plugin: Contract & Plugin) {
        //manager.setPluginRemoveCallback(plugin, (name) => this.plugins.findIndex())
        this.plugins.push(plugin);
    }

}
