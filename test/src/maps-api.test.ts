import 'dotenv/config';
import { describe } from '@jest/globals';
import { getPlaceAutocomplete, GetPlaceAutocompleteParameters } from '../../src/maps-api';
import { mock } from 'pactum';

describe('getPlaceAutocomplete', () => {
    beforeAll(async () => {
        mock.addInteraction([
            {
                strict: false,
                request: {
                    method: 'GET',
                    path: `/search/2/search/${encodeURIComponent('Charlotte Street')}.json`,
                    queryParams: {
                        key: 'secret',
                    },
                },
                response: {
                    status: 200,
                    file: 'test/fixtures/charlotte_street.json',
                },
            },
            {
                strict: false,
                request: {
                    method: 'GET',
                    path: `/search/2/search/.json`,
                    queryParams: {
                        key: 'secret',
                    },
                },
                response: {
                    status: 200,
                    file: 'test/fixtures/asfasffasfasafsafs.json',
                },
            },
            {
                strict: false,
                request: {
                    method: 'GET',
                    path: `/search/2/search/asfasffasfasafsafs.json`,
                    queryParams: {
                        key: 'secret',
                    },
                },
                response: {
                    status: 200,
                    file: 'test/fixtures/asfasffasfasafsafs.json',
                },
            },
            {
                strict: false,
                request: {
                    method: 'GET',
                    path: `/search/2/search/unauthorised.json`,
                    queryParams: {
                        key: 'unauthorised',
                    },
                },
                response: {
                    status: 403,
                    body: '<h1>Developer Inactive</h1>',
                },
            },
            {
                strict: false,
                request: {
                    method: 'GET',
                    path: `/search/2/search/invalid.json`,
                    queryParams: {
                        key: 'invalid',
                    },
                },
                response: {
                    status: 200,
                    body: {
                        invalid: {
                            response: 'contents',
                        },
                    },
                },
            },
        ]);

        await mock.start(3000, 'localhost');
    });

    afterAll(async () => {
        await mock.stop();
    });

    const apiKey = 'secret';
    const apiUri = 'http://localhost:3000';

    it('should reject an empty api key', async () => {
        // given
        const params: GetPlaceAutocompleteParameters = {
            apiUri,
            apiKey: '',
            rawQuery: '',
        };

        // when
        const promise = getPlaceAutocomplete(params);

        // then
        await expect(promise).rejects.toThrow();
    });

    it('should expect handle an unexpected request', async () => {
        // given
        const params: GetPlaceAutocompleteParameters = {
            apiUri,
            apiKey: 'unauthorised',
            rawQuery: 'unauthorised',
        };

        // when
        const promise = getPlaceAutocomplete(params);

        // then
        await expect(promise).rejects.toThrow();
    });

    it('should reject an unexpected response', async () => {
        // given
        const params: GetPlaceAutocompleteParameters = {
            apiUri,
            apiKey: 'invalid',
            rawQuery: 'invalid',
        };

        // when
        const promise = getPlaceAutocomplete(params);

        // then
        await expect(promise).rejects.toThrow();
    });

    it('should gracefully handle no results', async () => {
        // given
        const params: GetPlaceAutocompleteParameters = {
            apiUri,
            apiKey,
            rawQuery: 'asfasffasfasafsafs',
        };

        // when
        const promise = getPlaceAutocomplete(params);

        // then
        await expect(promise).resolves.toStrictEqual([]);
    });

    it('should map a response into addresses', async () => {
        // given
        const params: GetPlaceAutocompleteParameters = {
            apiUri,
            apiKey,
            rawQuery: 'Charlotte Street',
        };

        // when
        const result = await getPlaceAutocomplete(params);

        // then
        expect(result.length).toBeGreaterThan(0);
        // all results are australian
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
