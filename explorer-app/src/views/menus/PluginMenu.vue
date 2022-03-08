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
                        <ion-label position="floating">{{param.name}}</ion-label>
                        <ion-input :placeholder="param.default" v-model="param.value" @keyup="modified=true"></ion-input>
                        <ion-button slot="end" color="light" shape="round" @click="param.value = param.default">
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
import {defineComponent, reactive, ref} from 'vue';
import {
    IonAccordion,
    IonAccordionGroup,
    IonButton,
    IonContent, IonFab, IonFabButton, IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonPage
} from '@ionic/vue';
import {refresh, save} from 'ionicons/icons'
import StandardHeader from "@/components/headers/StandardHeader.vue";
import {services} from '@/modules/app/services';
import {startCase} from 'lodash';
export default defineComponent({
    name: "PluginMenu",
    components: {StandardHeader, IonContent, IonPage, IonAccordion, IonItem, IonList, IonLabel, IonAccordionGroup, IonInput, IonButton, IonIcon, IonFab, IonFabButton},
    setup() {

        const plugins = (services?.pluginManager?.getPluginConfigs() || []);
        const modified = ref(false);

        function getPluginParams(name: string) {
            return reactive(services?.pluginManager?.getPluginParams(name) || []);
        }

        return {plugins, modified, getPluginParams, startCase, refresh, save}
    }
})
</script>

<style scoped>

</style>