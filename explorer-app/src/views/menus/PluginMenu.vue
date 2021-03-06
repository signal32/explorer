<!-- Lists loaded plugins and enables their parameters to be tweaked-->

<template>
    <ion-page>
        <standard-header :title="'Plugins'"/>

        <ion-content :fullscreen="true">

            <ion-item color="tertiary">
                <ion-icon slot="start" :icon="extensionPuzzleOutline"></ion-icon>
                <ion-label>
                    <h1>Customise with plugins</h1>
                    <p>Install plugins to provide custom data and insights.</p>
                </ion-label>
<!--                <ion-button size="medium" color="light">Install</ion-button>-->
            </ion-item>

            <ion-accordion-group>
            <ion-accordion v-for="plugin in plugins" :key="plugin.config.metadata.name" :value="plugin.config.metadata.name">
                <ion-item slot="header">
                    <ion-label>{{plugin.config.metadata.name}}</ion-label>
                </ion-item>

                <ion-list slot="content">
                    <ion-item>
                        <ion-label><h3>Enabled</h3></ion-label>
                        <ion-checkbox slot="end" :checked="plugin.enabled" v-on:click="setEnabled(plugin.config.metadata.name, !plugin.enabled)"></ion-checkbox>
                    </ion-item>
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            <p>{{plugin.config.metadata.description}}</p>
                            <p>Version: {{plugin.config.metadata.version}}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item v-for="param in getPluginParams(plugin.config.metadata.name)" :key="param.name">
                        <ion-label position="floating">{{param.name}}</ion-label>

                        <ion-select v-if="param.options" placeholder="Select One" interface="popover">
                            <ion-select-option v-for="option in param.options" :key="option" :value="param.value.value" @click="param.value.value = option">{{ option }}</ion-select-option>
                        </ion-select>

                        <ion-input v-else :placeholder="param.default" v-model="param.value.value" @keyup="modified=true"/>

                        <ion-button v-if="param.default" slot="end" color="light" shape="round" @click="param.value.value = param.default">
                            <ion-icon :icon="refresh"/>
                        </ion-button>
                    </ion-item>
                </ion-list>
            </ion-accordion>
            </ion-accordion-group>

            <ion-fab v-if="modified" vertical="bottom" horizontal="end" slot="fixed">
                <ion-fab-button>
                    <ion-icon :icon="save"></ion-icon>
                </ion-fab-button>
            </ion-fab>

        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue';
import {
    IonAccordion, IonAccordionGroup,IonButton,
    IonContent, IonFab, IonFabButton, IonIcon,
    IonInput, IonItem, IonLabel, IonList, IonPage, IonCheckbox, IonSelect, IonSelectOption
} from '@ionic/vue';
import {refresh, save, extensionPuzzleOutline} from 'ionicons/icons'
import StandardHeader from "@/components/util/StandardHeader.vue";
import {services} from '@/modules/app/services';
import {startCase} from 'lodash';
export default defineComponent({
    name: "PluginMenu",
    components: {StandardHeader, IonContent, IonPage, IonAccordion, IonItem, IonList, IonLabel, IonAccordionGroup, IonInput, IonButton, IonIcon, IonFab, IonFabButton, IonCheckbox, IonSelect, IonSelectOption},
    setup() {
        const plugins = (services?.pluginManager?.getPluginConfigs() || []);
        const modified = ref(false);

        function getPluginParams(name: string) {
            const params = services?.pluginManager?.getPluginParams(name);
            if (params) {
                return params.map(param => {
                    return {
                        value: computed<boolean | number | string>({
                            get: () => {return param.get() as boolean | number | string},
                            set: (value) => {
                                console.debug(`setting ${param.name} as ${value}`);
                                if (param.type == 'string') param.set?.(value as string);
                                else if (param.type == 'number') param.set?.(value as number);
                                else if (param.type == 'boolean') param.set?.(value as boolean);
                            }
                        }),
                        ...param,
                    }
                })
            }
            else return[];
        }

        function setEnabled(name: string, state: boolean) {
            if (state) services.pluginManager?.enablePlugin(name);
            else services.pluginManager?.disablePlugin(name);
        }

        return {plugins, modified, getPluginParams, startCase, setEnabled, refresh, save, extensionPuzzleOutline}
    }
})
</script>

<style scoped>

</style>