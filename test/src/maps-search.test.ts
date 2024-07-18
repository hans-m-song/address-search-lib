import 'dotenv/config';
import { describe } from '@jest/globals';
import { getAutoCompleteDetails } from '../../src';

const test = process.env.JEST_ENABLE_E2E === 'true' ? it : it.skip;

// These are end-to-end tests and need an api key
// remove `set JEST_ENABLE_E2E` to enable these tests
describe('Tomtom Places E2E Tests', () => {
    describe('getAutoCompleteDetails', () => {
        test('can fetch from the autocomplete api', async () => {
            // given
            const query = 'Charlotte Street';

            // when
            const result = await getAutoCompleteDetails(query);

            // then
            expect(result.length).toBeGreaterThan(0);
            expect(result).toMatchObject(
                expect.arrayContaining([
                    expect.objectContaining({
                        municipality: expect.any(String),
                        country: expect.any(String),
                        countryCode: 'AU',
                        freeformAddress: expect.any(String),
                    }),
                ])
            );
        });
    });
});
