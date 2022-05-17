import {ActionDetailElement, DetailElement, DetailServiceFormatPlugin} from '@/modules/services/detailsService';
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
            title: 'About',
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
                const id = fact.subject.value;
                const title = id.substr(id.lastIndexOf('/') + 1); // id is assumed to be last part of url, consider finding more robust alternative (i.e. page id)

                const res = await this.axios.get(`https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${title}`);
                const data = Object.entries(res.data.query.pages)[0][1] as unknown as any;
                const description = data?.extract as string;
                section.elements.push({
                    id: 'wikipedia_excerpt',
                    title: "Description",
                    type: 'text',
                    body: (description.length > 512) ? description.slice(0,512) + '...' : description,
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