import { Address, getPlaceAutocomplete } from './maps-api';

/**
 * Provides a simplified interface for fuzzy text address searches
 *
 * @deprecated for more options, refer to getPlaceAutocomplete
 *
 * @param address Free text field to autocomplete
 */
export async function getAutoCompleteDetails(address: string): Promise<Address[]> {
    // get autocomplete results
    const res = await getPlaceAutocomplete({ rawQuery: address });

    return res;
}
