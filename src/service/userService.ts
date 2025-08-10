import bcrypt from 'bcrypt';
import { Operator, TableName } from '../utils/enum';
import { DbService } from '../utils/database/services/dbService';
import { findWithColumnFilters } from '../utils/database/helpers/dbHelpers';
import { DbResponse } from '../utils/database/services/dbResponse';
import { Resource } from '../utils/resources/resource';
import User from '../model/user/user';

/** DTO for user creation */
export interface CreateUserDTO {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly password: string;
}

/** DTO for user update */
export type UpdateUserDTO = Partial<CreateUserDTO>;

/** User without sensitive fields */
export type SanitizedUser = Omit<User, 'password'>;

export class UserService extends DbService {
    constructor() {
        super(TableName.USER);
    }

    /** @summary Removes sensitive fields from the user object.
     * @param data Raw user object with sensitive fields.
     * @returns User object without the password.
     */
    private sanitizeUser(data?: User | null): SanitizedUser | null | undefined {
        if (!data) return data;
        const { password, ...safeUser } = data;
        return safeUser;
    }

    /** @summary Creates a new user with a unique email and hashed password.
     * @param data User registration data.
     * @returns Created user record or error if email is already in use.
     */
    async createUser(data: CreateUserDTO): Promise<DbResponse<SanitizedUser>> {
        data.email = data.email.trim().toLowerCase();

        const existingUsers = await this.findWithFilters<User>({
            email: { operator: Operator.EQUAL, value: data.email }
        });

        if (existingUsers.data?.length) {
            return { success: false, error: Resource.EMAIL_IN_USE };
        }

        data.password = await bcrypt.hash(data.password, 10);
        const result = await this.create(data);

        if (!result.success || !result.data?.id) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        const created = await this.findOne<User>(result.data.id);
        return {
            ...created,
            data: this.sanitizeUser(created.data)
        };
    }

    /** @summary Retrieves a list of all users in the database.
     * @returns List of user records.
     */
    async getUsers(): Promise<DbResponse<SanitizedUser[]>> {
        const users = await this.findMany<User>();
        return {
            ...users,
            data: users.data?.map(this.sanitizeUser)
        };
    }

    /** @summary Retrieves a user by their unique ID.
     * @param id ID of the user.
     * @returns User record if found, or error if not.
     */
    async getUserById(id: number): Promise<DbResponse<SanitizedUser>> {
        const user = await this.findOne<User>(id);
        if (!user.success) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }
        return {
            ...user,
            data: this.sanitizeUser(user.data)
        };
    }

    /** @summary Searches for users by partial email using a LIKE clause.
     * @param emailTerm Email search term (partial match).
     * @returns List of users matching the email filter.
     */
    async getUsersByEmail(emailTerm: string): Promise<DbResponse<SanitizedUser[]>> {
        const result = await findWithColumnFilters<User>(TableName.USER, {
            email: { operator: Operator.LIKE, value: emailTerm }
        });
        return {
            ...result,
            data: result.data?.map(this.sanitizeUser)
        };
    }

    /** @summary Updates a user by ID and rehashes the password if it has changed.
     * @param id ID of the user to update.
     * @param data Partial user data.
     * @returns Updated user or error if not found.
     */
    async updateUser(id: number, data: UpdateUserDTO): Promise<DbResponse<SanitizedUser>> {
        const current = await this.findOne<User>(id);

        if (data.password && current.success && current.data?.password) {
            const isSamePassword = await bcrypt.compare(data.password, current.data.password);
            if (!isSamePassword) {
                data.password = await bcrypt.hash(data.password, 10);
            } else {
                delete data.password;
            }
        }

        await this.update(id, data);
        const updated = await this.findOne<User>(id);
        return {
            ...updated,
            data: this.sanitizeUser(updated.data)
        };
    }

    /** @summary Deletes a user by ID after validating its existence.
     * @param id ID of the user to delete.
     * @returns Success with deleted ID, or error if user does not exist.
     */
    async deleteUser(id: number): Promise<DbResponse<{ id: number }>> {
        const existingUser = await this.findOne(id);

        if (!existingUser.success) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }

        return this.remove(id);
    }
}
