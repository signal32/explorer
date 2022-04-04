import * as query from '@/modules/query/queryAbstractionLayer'
import {LatLng, LatLngBounds, LatLngBoundsLike} from '@/modules/geo/types';

// These are loose tests to sanity check changes to query and make sure they don't fall begin any upstream changes.
// They are NOT infallible! (far from it)
// Changes to the external data structure may cause tests to fail when they are technically correct.

describe('Query Abstraction Layer (WikiData)', () => {
    const endpoint = 'https://query.wikidata.org/sparql';
    const testArea = new LatLngBounds(new LatLng(57.1443733, -2.096472), new LatLng(57.1132776, -2.1501791));
    //console.warn('These tests are dependant on an external service.')

    it('getEntity', async () => {
        const result = await query.getEntity([`wd:Q42`], endpoint);

        expect(result.length).toBe(1);
        expect(result[0].name).toBe('Douglas Adams');
        expect(result[0].thumbnailUrl).toContain('http://'); // Link may change, but so long as something is there we are happy
        expect(result[0].category).toBeTruthy();
        if (result[0].category){
            expect(result[0].category.id).toBe('wd:Q5');
            expect(result[0].category.name).toBe('human');
        }
    })

    it ('GetGeoEntity', async () => {
        const result = await query.getGeoEntity([`wd:Q36405`], endpoint);
        expect(result.length).toBe(2); // Big city and small city categories
        expect(result[0].name).toBe('Aberdeen');
        expect(result[0].thumbnailUrl).toContain('http://'); // Link may change, but so long as something is there we are happy
        expect(result[0].category).toBeTruthy();
        expect(result[0].position.lat).toBeTruthy()
        expect(result[0].position.lng).toBeTruthy()
        if (result[0].category){
            expect(result[0].category.id).toBe('wd:Q515');
            expect(result[0].category.name).toBe('city');
        }
    })

    it('getArea', async () => {
        const result = await query.getArea(testArea, ['wd:Q12280', 'wd:Q811979', 'wd:Q3947'], [], endpoint);
        expect(result.length).toBeGreaterThan(0);
        if (result[0]) expect(result[0].startsWith('wd:')).toBe(true); // Consider using a regex
    })

    it('getAreaNamed', async () => {
        const result = await query.getAreaNamed(testArea, 'Bridge of Dee', ['wd:Q12280', 'wd:Q811979', 'wd:Q3947'], [], endpoint);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toBe('wd:Q3644573')
        if (result[0]) expect(result[0].startsWith('wd:')).toBe(true); // Consider using a regex
    })

    it('GetLocation', async () => {
        const result = await query.getLocation(['wd:Q1017537'],['wd:Q12280', 'wd:Q811979', 'wd:Q3947'], [], endpoint);
        expect(result).toContain('wd:Q2171269'); // Should have the railway station
    })

    it('GetSimilarByCategory', async () => {
        const result = await query.getSimilarByCategory(['wd:Q2171269'], endpoint);
        expect(result.length).toBeGreaterThan(0);
    })
})