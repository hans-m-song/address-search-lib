import { describe, expect, it } from '@jest/globals';
import { safeAwait, sanitiseError } from '../../../src/lib/utility';

describe('safeAwait', () => {
    it('should result in success=true if the promise resolves', async () => {
        // given
        const value = 'hello';
        const promise = Promise.resolve(value);

        // when
        const result = safeAwait(promise);

        // then
        await expect(result).resolves.toMatchObject({ success: true, data: value });
    });

    it('should result in success=false if the promise rejects', async () => {
        // given
        const value = 'hello';
        const promise = Promise.reject(new Error(value));

        // when
        const result = safeAwait(promise);

        // then
        await expect(result).resolves.toMatchObject({ success: false, error: expect.any(Error) });
    });
});

class MockAxiosError {
    /**
     * this is the only thing `axios.isAxiosError` checks
     *
     * https://github.com/axios/axios/blob/0e4f9fa29077ebee4499facea6be1492b42e8a26/lib/helpers/isAxiosError.js#L12
     */
    isAxiosError = true;
    toJSON = jest.fn();
}

describe('sanitiseError', () => {
    it.each([undefined, null, 1, 'hello'])('should not touch %s', (input) => {
        expect(sanitiseError([], input)).toStrictEqual(input);
    });

    it('should remove a known value from an axios error', () => {
        // given
        const secrets = ['lorem', 'ipsum', 'dolor', 'amet'];
        const error = new MockAxiosError();
        error.toJSON.mockImplementation(() => ({
            super: {
                nested: {
                    array: [secrets[0]],
                    property: secrets[1],
                },
                safe: {
                    property: 'unrelated',
                    array: ['blah'],
                },
            },
        }));

        // when
        const sanitised = sanitiseError(secrets, error);

        // then
        expect(sanitised).toStrictEqual({
            super: {
                nested: {
                    array: ['REDACTED'],
                    property: 'REDACTED',
                },
                safe: {
                    property: 'unrelated',
                    array: ['blah'],
                },
            },
        });
    });
});
