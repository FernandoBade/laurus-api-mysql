import bcrypt from 'bcrypt';
import path from 'path';
import { Readable } from 'stream';
import { Client as FtpClient } from 'basic-ftp';
import { Operator, Theme, Language, Currency, DateFormat, Profile } from '../utils/enum';
import { UserRepository } from '../repositories/userRepository';
import { Resource } from '../utils/resources/resource';
import { SelectUser } from '../db/schema';
import { QueryOptions } from '../utils/pagination';
import { TokenService } from './tokenService';
import { sendEmailVerificationEmail } from '../utils/email/authEmail';

export type SanitizedUser = Omit<SelectUser, 'password'>;

const AVATAR_PUBLIC_BASE_URL = 'https://laurus.bade.digital/laurus/users';
const AVATAR_FILE_BASE = 'avatar';
const AVATAR_BACKUP_BASE = 'avatar_old';

const resolveAvatarExtension = (mimeType: string) => {
    if (mimeType === 'image/png' || mimeType === 'image/x-png') {
        return 'png';
    }
    return 'jpg';
};

/**
 * Service for user business logic.
 * Handles user operations including authentication and data sanitization.
 */
export class UserService {
    private userRepository: UserRepository;
    private tokenService: TokenService;

    constructor() {
        this.userRepository = new UserRepository();
        this.tokenService = new TokenService();
    }

    /**
     * Removes sensitive fields from the user object.
     *
     * @summary Sanitizes user data by removing password.
     * @param data - Raw user object with sensitive fields.
     * @returns User object without the password.
     */
    private sanitizeUser(data: SelectUser): SanitizedUser {
        const { password, ...safeUser } = data;
        return safeUser;
    }

    /**
     * Creates a new user with a unique email and hashed password.
     * Validates that the email is not already registered.
     *
     * @summary Creates a new user account with email validation.
     * @param data - User registration data.
     * @returns Created user record or error if email is already in use.
     */
    async createUser(data: { firstName: string; lastName: string; email: string; password: string; phone?: string; birthDate?: Date; theme?: Theme; language?: Language; currency?: Currency; dateFormat?: DateFormat; profile?: Profile; hideValues?: boolean; active?: boolean }): Promise<{ success: true; data: SanitizedUser } | { success: false; error: Resource }> {
        data.email = data.email.trim().toLowerCase();

        const existingUsers = await this.userRepository.findMany({
            email: { operator: Operator.EQUAL, value: data.email }
        });

        if (existingUsers.length > 0) {
            return { success: false, error: Resource.EMAIL_IN_USE };
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const created = await this.userRepository.create({
            ...data,
            password: hashedPassword,
        });

        const rollbackUser = async () => {
            try {
                await this.userRepository.delete(created.id);
            } catch {
                // Ignore rollback failures to avoid masking the root error.
            }
        };

        try {
            const tokenResult = await this.tokenService.createEmailVerificationToken(created.id);
            if (!tokenResult.success || !tokenResult.data) {
                await rollbackUser();
                return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
            }

            await sendEmailVerificationEmail(created.email, tokenResult.data.token, created.id);
        } catch {
            await rollbackUser();
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        return {
            success: true,
            data: this.sanitizeUser(created)
        };
    }

    /**
     * Retrieves a list of all users in the database.
     *
     * @summary Gets all users with optional pagination and sorting.
     * @param options - Query options for pagination and sorting.
     * @returns List of user records.
     */
    async getUsers(options?: QueryOptions<SelectUser>): Promise<{ success: true; data: SanitizedUser[] } | { success: false; error: Resource }> {
        try {
            const users = await this.userRepository.findMany(undefined, {
                limit: options?.limit,
                offset: options?.offset,
                sort: options?.sort as keyof SelectUser,
                order: options?.order === Operator.DESC ? "desc" : "asc",
            });
            return {
                success: true,
                data: users.map(u => this.sanitizeUser(u))
            };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Counts all users.
     *
     * @summary Gets total count of users.
     * @returns Total user count.
     */
    async countUsers(): Promise<{ success: true; data: number } | { success: false; error: Resource }> {
        try {
            const count = await this.userRepository.count();
            return { success: true, data: count };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Retrieves a user by their unique ID.
     *
     * @summary Gets a single user by ID.
     * @param id - ID of the user.
     * @returns User record if found, or error if not.
     */
    async getUserById(id: number): Promise<{ success: true; data: SanitizedUser } | { success: false; error: Resource }> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }
        return {
            success: true,
            data: this.sanitizeUser(user)
        };
    }

    /**
     * Searches for users by partial email using a LIKE clause.
     *
     * @summary Finds users matching email pattern.
     * @param emailTerm - Email search term (partial match).
     * @returns List of users matching the email filter.
     */
    async getUsersByEmail(emailTerm: string, options?: QueryOptions<SelectUser>): Promise<{ success: true; data: SanitizedUser[] } | { success: false; error: Resource }> {
        try {
            const result = await this.userRepository.findMany({
                email: { operator: Operator.LIKE, value: emailTerm }
            }, {
                limit: options?.limit,
                offset: options?.offset,
                sort: options?.sort as keyof SelectUser,
                order: options?.order === Operator.DESC ? "desc" : "asc",
            });
            return {
                success: true,
                data: result.map(u => this.sanitizeUser(u))
            };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Retrieves users by exact email match.
     *
     * @summary Gets users with exact email match.
     * @param email - Email to match exactly.
     * @returns List of users matching the exact email.
     */
    async getUserByEmailExact(email: string, options?: QueryOptions<SelectUser>): Promise<{ success: true; data: SanitizedUser[] } | { success: false; error: Resource }> {
        try {
            const normalized = email.trim().toLowerCase();
            const result = await this.userRepository.findMany({
                email: { operator: Operator.EQUAL, value: normalized }
            }, {
                limit: options?.limit,
                offset: options?.offset,
                sort: options?.sort as keyof SelectUser,
                order: options?.order === Operator.DESC ? "desc" : "asc",
            });
            return {
                success: true,
                data: result.map(u => this.sanitizeUser(u))
            };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Retrieves a user by exact email match.
     *
     * @summary Gets a single user by exact email.
     * @param email - Email to match exactly.
     * @returns User record if found, or error if not.
     */
    async findUserByEmailExact(email: string): Promise<{ success: true; data: SanitizedUser } | { success: false; error: Resource }> {
        const normalized = email.trim().toLowerCase();
        const result = await this.userRepository.findMany({
            email: { operator: Operator.EQUAL, value: normalized }
        }, {
            limit: 2,
        });

        if (result.length === 0) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }

        if (result.length > 1) {
            throw new Error('RepositoryInvariantViolation: multiple users found');
        }

        return { success: true, data: this.sanitizeUser(result[0]) };
    }

    /**
     * Counts users matching an email term.
     *
     * @summary Gets count of users matching email pattern.
     * @param emailTerm - Email search term.
     * @returns Count of matching users.
     */
    async countUsersByEmail(emailTerm: string): Promise<{ success: true; data: number } | { success: false; error: Resource }> {
        try {
            const count = await this.userRepository.count({
                email: { operator: Operator.LIKE, value: emailTerm }
            });
            return { success: true, data: count };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }
    }

    /**
     * Updates a user by ID and rehashes the password if it has changed.
     *
     * @summary Updates user data with optional password rehashing.
     * @param id - ID of the user to update.
     * @param data - Partial user data.
     * @returns Updated user or error if not found.
     */
    async updateUser(id: number, data: Partial<SelectUser>): Promise<{ success: true; data: SanitizedUser } | { success: false; error: Resource }> {
        const current = await this.userRepository.findById(id);
        if (!current) {
            return { success: false, error: Resource.NO_RECORDS_FOUND };
        }

        if (data.password && current.password) {
            const isSamePassword = await bcrypt.compare(data.password, current.password);
            if (!isSamePassword) {
                data.password = await bcrypt.hash(data.password, 10);
            } else {
                delete data.password;
            }
        }

        const updated = await this.userRepository.update(id, data);
        return {
            success: true,
            data: this.sanitizeUser(updated)
        };
    }

    /**
     * Marks a user's email as verified.
     *
     * @summary Sets emailVerifiedAt timestamp for the user.
     * @param userId - User ID.
     * @returns Updated user or error.
     */
    async markEmailVerified(userId: number): Promise<{ success: true; data: SanitizedUser } | { success: false; error: Resource }> {
        const existing = await this.userRepository.findById(userId);
        if (!existing) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }

        if (existing.emailVerifiedAt) {
            return { success: true, data: this.sanitizeUser(existing) };
        }

        const updated = await this.userRepository.update(userId, { emailVerifiedAt: new Date() });
        return { success: true, data: this.sanitizeUser(updated) };
    }

    /**
     * Deletes a user by ID after validating its existence.
     *
     * @summary Removes a user from the database.
     * @param id - ID of the user to delete.
     * @returns Success with deleted ID, or error if user does not exist.
     */
    async deleteUser(id: number): Promise<{ success: true; data: { id: number } } | { success: false; error: Resource }> {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }

        await this.userRepository.delete(id);
        return { success: true, data: { id } };
    }

    /**
     * Finds a user by ID (internal method for compatibility).
     *
     * @summary Gets user by ID without sanitization.
     * @param id - User ID.
     * @returns User record or error.
     */
    async findOne(id: number): Promise<{ success: true; data: SelectUser } | { success: false; error: Resource }> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }
        return { success: true, data: user };
    }

    /**
     * Uploads an avatar image to FTP storage and updates the user's avatar URL.
     *
     * @summary Uploads user avatar and persists the public URL.
     * @param userId - ID of the user uploading an avatar.
     * @param file - Multer file buffer for the avatar.
     * @returns Public URL of the uploaded avatar or an error.
     */
    async uploadAvatar(userId: number, file: Express.Multer.File): Promise<{ success: true; data: { url: string } } | { success: false; error: Resource }> {
        const existingUser = await this.userRepository.findById(userId);
        if (!existingUser) {
            return { success: false, error: Resource.USER_NOT_FOUND };
        }

        const host = process.env.FTP_HOST;
        const user = process.env.FTP_USER;
        const password = process.env.FTP_PASSWORD;
        const uploadPath = process.env.FTP_UPLOAD_PATH;
        const portValue = Number(process.env.FTP_PORT ?? 21);
        const port = Number.isFinite(portValue) ? portValue : 21;

        if (!host || !user || !password || !uploadPath) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        }

        const extension = resolveAvatarExtension(file.mimetype);
        const fileName = `${AVATAR_FILE_BASE}.${extension}`;
        const normalizedPath = uploadPath.replace(/\/$/, '');
        const userAvatarPath = `${normalizedPath}/${userId}/avatar`;
        const publicUrl = `${AVATAR_PUBLIC_BASE_URL}/${userId}/avatar/${fileName}`;
        const ftpClient = new FtpClient();

        try {
            await ftpClient.access({
                host,
                port,
                user,
                password,
            });
            await ftpClient.ensureDir(userAvatarPath);
            const files = await ftpClient.list();
            const existingBackups = files.filter((entry) =>
                entry.name.startsWith(`${AVATAR_BACKUP_BASE}.`)
            );
            for (const backup of existingBackups) {
                try {
                    await ftpClient.remove(backup.name);
                } catch {
                    // Ignore cleanup failures to avoid blocking upload.
                }
            }
            const existingAvatar = files.find((entry) =>
                entry.name.startsWith(`${AVATAR_FILE_BASE}.`)
            );
            if (existingAvatar) {
                const currentExtension = path.extname(existingAvatar.name) || `.${extension}`;
                const backupName = `${AVATAR_BACKUP_BASE}${currentExtension}`;
                try {
                    await ftpClient.rename(existingAvatar.name, backupName);
                } catch {
                    // Ignore rename failures and attempt upload anyway.
                }
            }
            await ftpClient.uploadFrom(Readable.from(file.buffer), fileName);
            await this.userRepository.update(userId, { avatarUrl: publicUrl });
            return { success: true, data: { url: publicUrl } };
        } catch (error) {
            return { success: false, error: Resource.INTERNAL_SERVER_ERROR };
        } finally {
            ftpClient.close();
        }
    }
}
