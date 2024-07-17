import { z } from 'zod';

export type FuzzySearchResultAddress = z.infer<typeof FuzzySearchResultAddressSchema>;

/**
 * not all fields are available, depending on address type
 *
 * e.g. street, muncipality
 */
export const FuzzySearchResultAddressSchema = z.object({
    streetNumber: z.string().optional(),
    streetName: z.string().optional(),
    municipality: z.string().optional(),
    country: z.string(),
    countryCode: z.string(),
    freeformAddress: z.string(),
});

/**
 * Element of `FuzzySearchResponse`
 */
export type FuzzySearchResult = z.infer<typeof FuzzySearchResultSchema>;

export const FuzzySearchResultSchema = z.object({
    type: z.string(),
    id: z.string(),
    score: z.number(),
    address: FuzzySearchResultAddressSchema,
});

/**
 * Response of `/search/2/search/{query}.json`
 */
export type FuzzySearchResponse = z.infer<typeof FuzzySearchResponseSchema>;

export const FuzzySearchResponseSchema = z.object({
    summary: z.object({
        query: z.string(),
        numResults: z.number(),
        offset: z.number(),
        totalResults: z.number(),
    }),
    results: z.array(FuzzySearchResultSchema),
});
