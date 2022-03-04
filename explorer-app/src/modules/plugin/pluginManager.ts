import {Services, services} from '@/modules/app/services';

export interface Plugin {
    initialise(services: Services): number | void,
}

export function loadPlugins(plugins: Plugin[]) {
    for (const plugin of plugins) {
        plugin.initialise(services);
    }
}


export class PluginService<Contract> {
    private plugins: (Contract & Plugin)[] = [];
    public readonly methods: Contract;

    constructor(defineMethods: (plugins: Contract[]) => Contract) {
        this.methods = defineMethods(this.plugins);
    }

    public register(plugin: Contract & Plugin) {
        this.plugins.push(plugin);
    }

}
