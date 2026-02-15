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
