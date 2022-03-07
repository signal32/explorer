import {Services, services} from '@/modules/app/services';

export interface PluginManager {
    loadPlugin: (plugin: Plugin) => void,
    unloadPlugin: (name: string) => boolean,
    getPluginParams: () => Map<string, PluginParam[]>,
    setPluginParam: (scope: string, param: PluginParam) => void,
    setPluginRemoveCallback: (name: string, cb: (name: string) => void) => void,
}

export interface Plugin {
    initialise(services: Services): PluginConfig,
}

interface PluginConfig {
    metadata: PluginMeta,
    configVariables?: () => PluginParam[];
}

interface PluginParam {
    name: string,
    value: string | number | undefined,
    default?: string | number
}

interface PluginMeta {
    name: string,
    description?: string,
    version?: string
}

const storePluginPrefix = 'explorer-plugin-';


export class AppPluginManager implements PluginManager {

    private loadedPlugins = new Map<string, {instance: Plugin, config: PluginConfig, destroyCb: ((name: string) => void)[]}>();

    constructor(private services: Services) { }

    async loadPlugin(plugin: Plugin) {
        const config = plugin.initialise(this.services);
        await this.bindVariables(config);
        this.loadedPlugins.set(config.metadata.name, {instance: plugin, config, destroyCb: []});
    }

    unloadPlugin(name: string): boolean {
        return false;
    }

    getPluginParams(): Map<string, PluginParam[]> {
        const configMap = new Map<string, PluginParam[]>();
        this.loadedPlugins.forEach(p => {
            if (p.config.configVariables) {
                configMap.set(p.config.metadata.name, p.config.configVariables())
            }
        });
        return configMap;
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

    private async bindVariables(config: PluginConfig) {
        const params = (config.configVariables) ? config.configVariables() : [];

        for (const param of params) {
            const value = await this.services.store.get(storePluginPrefix + param.name);
            param.value = (value) ? value : param.default;
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
