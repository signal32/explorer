import {WikiDataPlugin, wikidataPlugin} from '@/modules/query/WikidataPlugin';

describe('WikiData Plugin', () => {
    let plugin: WikiDataPlugin;

    beforeAll(() => {
        plugin = wikidataPlugin;
    })

    it('getById', async () => {
        let result = await plugin.getById('Q42');

        expect(result?.id).toBe('Q42')
        expect(result?.name).toBe('Douglas Adams');
        expect(result?.category?.id).toBe('Q5');
        expect(result?.category?.name).toBe('human');
    })
})