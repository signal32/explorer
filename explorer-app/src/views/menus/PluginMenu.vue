<!-- Lists loaded plugins and enables their parameters to be tweaked-->

<template>
    <ion-page>
        <standard-header :title="'Plugins'"/>

        <ion-content :fullscreen="true">

            <ion-item color="warning">
                <ion-label>
                    <h1>Warning</h1>
                    <p>Updating of plugin parameters is not yet fully implemented.</p>
                </ion-label>
            </ion-item>

            <ion-accordion-group>
            <ion-accordion v-for="plugin in plugins" :key="plugin.metadata.name" value="user">
                <ion-item slot="header">
                    <ion-label>{{plugin.metadata.name}}</ion-label>
                </ion-item>

                <ion-list slot="content">
                    <ion-item>
                        <ion-label class="ion-text-wrap">
                            <p>{{plugin.metadata.description}}</p>
                            <p>Version: {{plugin.metadata.version}}</p>
                        </ion-label>
                    </ion-item>
                    <ion-item v-for="param in getPluginParams(plugin.metadata.name)" :key="param.name">
                        <ion-label class="ion-text-wrap">
                            <h3>{{startCase(param.name)}}:</h3>
                        </ion-label>
                        <ion-input :placeholder="param.default" v-model="param.value"></ion-input>
                        <ion-button color="light">Reset</ion-button>
                    </ion-item>
                </ion-list>
            </ion-accordion>
            </ion-accordion-group>
        </ion-content>
    </ion-page>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonContent,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonPage
} from '@ionic/vue';
import StandardHeader from "@/components/headers/StandardHeader.vue";
import {services} from '@/modules/app/services';
import {startCase} from 'lodash';
export default defineComponent({
    name: "PluginMenu",
    components: {StandardHeader, IonContent, IonPage, IonAccordion, IonItem, IonList, IonLabel, IonAccordionGroup, IonInput, IonButton},
    setup() {
        const plugins = (services?.pluginManager?.getPluginConfigs() || []);


        function getPluginParams(name: string) {
            return services?.pluginManager?.getPluginParams(name) || [];
        }

        function setPluginParam(pluginName: string, paramName: string, value: string) {
            services?.pluginManager?.setPluginParam(pluginName, {name: paramName, value: value})
        }

        return {plugins, getPluginParams, startCase}
    }
})
</script>

<style scoped>

</style>