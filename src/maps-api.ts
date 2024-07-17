import axios from 'axios';
import { FuzzySearchResponseSchema } from './lib/FuzzySearchSchema';
import { safeAwait } from './lib/utility';
import { z } from 'zod';

export type Address = z.infer<typeof AddressSchema>;

export const AddressSchema = z.object({
    placeId: z.string(),
    streetNumber: z.string().optional(),
    streetName: z.string().optional(),
    municipality: z.string().optional(),
    country: z.string(),
    countryCode: z.string(),
    freeformAddress: z.string(),
});

export interface GetPlaceAutocompleteParameters {
    /**
     * fuzzy text input
     */
    rawQuery: string;
    /**
     * number of results to return
     *
     * @default 100
     */
    limit?: number;
    /**
     * throws an error if not provided and one is unable to be found
     * @default process.env.TOMTOM_API_KEY
     */
    apiKey?: string;
    /**
     * @default process.env.TOMTOM_API_KEY ?? 'https://api.tomtom.com'
     */
    apiUri?: string;
}

/**
 * Shim around the TomTom fuzzy search API, validates and maps the response to an address object
 *
 * based on api version 2, 2023.06.27
 *
 * https://developer.tomtom.com/search-api/documentation/search-service/fuzzy-search
 *
 * @todo additional fields e.g. geographic proximity, pagination, fuzzy level, etc
 * @todo support paginating the tomtom api
 * @todo supporting pagination parameters
 * @todo parameterise default filtering fields
 */
export async function getPlaceAutocomplete(params: GetPlaceAutocompleteParameters): Promise<Address[]> {
    const rawQuery = params.rawQuery;
    const apiKey = params.apiKey ?? process.env.TOMTOM_API_KEY;
    const apiUri = params.apiUri ?? process.env.TOMTOM_API_URI ?? 'https://api.tomtom.com';
    const limit = params.limit ?? 100;

    if (!apiKey) {
        throw new Error('Must specify an api key or set TOMTOM_API_KEY environment variable');
    }

    const serialisedQuery = encodeURIComponent(rawQuery);
    const endpoint = `${apiUri}/search/2/search/${serialisedQuery}.json`;
    const response = await safeAwait(
        axios.get(endpoint, {
            params: {
                key: apiKey,
                countrySet: ['AUS'],
                limit,
                language: 'en-AU',
            },
        })
    );

    if (!response.success) {
        throw new Error(`failed to fuzzy search for query "${rawQuery}": ${response.error}`);
    }

    const validated = FuzzySearchResponseSchema.safeParse(response.data.data);
    if (!validated.success) {
        const error = JSON.stringify(validated.error.issues);
        throw new Error(`failed to validate fuzzy search response for query "${rawQuery}": ${error}`);
    }

    // enforce australian results
    const filtered = validated.data.results.filter((result) => result.address.countryCode === 'AU');

    const mapped = filtered.map((result) => ({
        placeId: result.id,
        streetNumber: result.address.streetNumber,
        streetName: result.address.streetName,
        municipality: result.address.municipality,
        country: result.address.country,
        countryCode: result.address.countryCode,
        freeformAddress: result.address.freeformAddress,
    }));

    return mapped;
}
