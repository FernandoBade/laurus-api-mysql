import type { GetUserByIdOutput, UserId } from "@shared/domains/user/user.types";
import { HttpMethod } from "@shared/enums/http.enums";
import { ApiRoutePath } from "@shared/enums/routes.enums";
import { request } from "@/api/http/httpClient";
import type { ApiResponse } from "@/api/http/httpTypes";

function buildGetUserByIdPath(userId: UserId): string {
    return ApiRoutePath.USER_BY_ID.replace(":id", String(userId));
}

/**
 * @summary Fetches a user entity by id from the backend API.
 * @param userId User identifier from the authenticated session context.
 * @returns Standard API response with the resolved user payload.
 */
export async function getUserById(userId: UserId): Promise<ApiResponse<GetUserByIdOutput>> {
    return request<GetUserByIdOutput>(buildGetUserByIdPath(userId), {
        method: HttpMethod.GET,
    });
}
