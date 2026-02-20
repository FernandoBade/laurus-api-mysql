/**
 * @summary Credential modes accepted by the Fetch API `credentials` option.
 */
export enum FetchCredentialsMode {
    OMIT = "omit",
    SAME_ORIGIN = "same-origin",
    INCLUDE = "include",
}

/**
 * @summary Authorization schemes used when composing HTTP `Authorization` headers.
 */
export enum AuthScheme {
    BEARER = "Bearer",
}

/**
 * @summary HTTP methods used by API clients and request helpers.
 */
export enum HttpMethod {
    GET = "GET",
    POST = "POST",
}

/**
 * @summary Standard HTTP header names used by API clients.
 */
export enum HttpHeaderName {
    ACCEPT_LANGUAGE = "Accept-Language",
    AUTHORIZATION = "Authorization",
    CONTENT_TYPE = "Content-Type",
}

/**
 * @summary HTTP content type values used in API requests.
 */
export enum HttpContentType {
    APPLICATION_JSON = "application/json",
}
