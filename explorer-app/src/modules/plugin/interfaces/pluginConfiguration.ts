export interface PluginConfig {
    friendlyName: string,
    isEnabled?: boolean,
    params: PluginParameter<any>[],
}

export interface AppPlugin {
    definePlugin() : PluginConfig,
}

/**
 * Defines which part of the application a parameter applies to
 * and is used to decide where this option is shown in menus.
 */
type ParameterScope = 'settings' | 'map_options';

/**
 * A configurable value that is used by a plugin.
 */
export interface PluginParameter<T> {
    name: string,
    value: T,
    scope?: ParameterScope,
}