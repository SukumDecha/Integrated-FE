export function buildSearchParams(params) {
    const searchParams = new URLSearchParams();

    for (const key in params) {
        if (params[key] !== undefined && params[key] !== null) {
            searchParams.append(key, params[key]);
        }
    }

    return searchParams.toString();
}

export function parseSearchParams(search) {
    const params = new URLSearchParams(search);
    const result = {};

    for (const [key, value] of params.entries()) {
        if (value !== undefined && value !== null) {
            result[key] = value;
        }
    }

    return result;
}
