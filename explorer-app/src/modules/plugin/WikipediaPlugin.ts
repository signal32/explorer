import {ActionDetailElement, DetailElement, DetailServiceFormatPlugin} from '@/modules/query/detailsService';
import {Plugin, PluginConfig} from '@/modules/plugin/pluginManager'
import {Entity} from '@/modules/geo/entity';
import {Quad} from '@rdfjs/types';
import {Services} from '@/modules/app/services';
import {createAxios} from '@/modules/auth/setup';

export class WikipediaPlugin implements DetailServiceFormatPlugin, Plugin {

    private axios = createAxios({
        //baseURL: '',
        timeout: 1500,
    });

    initialise(services: Services): PluginConfig {
        return {
            metadata: {
                name: "Wikipedia Plugin",
                version: "0.0.1",
                description: "Gets textual descriptions for entities from Wikipedia"
            },
            onEnable: () => services.detailService.format.register(this),
            onDisable: () => services.detailService.format.remove(this),
        };
    }

    async format(entity: Entity, facts: Quad[]): Promise<DetailElement[]> {
        const section: DetailElement = {
            id: 'wikipedia',
            type: 'section',
            title: 'Wikipedia',
            elements: []
        };

        const actions: ActionDetailElement = {
            id: 'wikipedia_actions',
            type: 'actions',
            actions: [],
        }

        for (const fact of facts) {
            // If Wikipedia article exists, show its extract
            if (fact.predicate.value.includes('about') && fact.subject.value.includes('en.wikipedia')){
                console.log(fact.object, fact.subject);
                const id = fact.subject.value;
                const title = id.substr(id.lastIndexOf('/') + 1);
                console.log('title' + title);

                const res = await this.axios.get(`http://en.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${title}`);
                const data = Object.entries(res.data.query.pages)[0][1] as unknown as any;
                console.log(data?.extract);
                section.elements.push({
                    id: 'wikipedia_excerpt',
                    title: "Abstract",
                    type: 'text',
                    body: data?.extract as string,
                });

                actions.actions.push({title: 'View on Wikipedia', url: fact.subject.value})
            }

            // Link to commons
            if (fact.predicate.value.includes('about') && fact.subject.value.includes('commons')){
                actions.actions.push({title: 'See images on Commons', url: fact.subject.value})
            }
        }

        // Only return elements and sections if they are populated with something
        if (actions.actions.length > 0) section.elements.push(actions);
        return (section.elements.length > 0) ? [section] : [];
    }

}