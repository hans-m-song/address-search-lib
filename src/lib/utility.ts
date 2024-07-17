import axios from 'axios';

export type TryCatch<T> =
    | {
          success: true;
          data: T;
      }
    | {
          success: false;
          error: any;
      };

export const safeAwait = async <T>(promise: Promise<T>): Promise<TryCatch<T>> => {
    try {
        const data = await promise;
        return { success: true, data };
    } catch (error) {
        return { success: false, error };
    }
};

export const sanitiseError = (valueBlacklist: string[], error: unknown): unknown => {
    if (!error || !axios.isAxiosError(error)) {
        return error;
    }

    const contents = JSON.stringify(error.toJSON(), (_, value) => {
        if (typeof value !== 'string') {
            return value;
        }

        for (const blacklisted of valueBlacklist) {
            if (value === blacklisted || value.includes(blacklisted)) {
                return 'REDACTED';
            }
        }

        return value;
    });

    return JSON.parse(contents);
};
