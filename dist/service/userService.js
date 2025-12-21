"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const enum_1 = require("../utils/enum");
const userRepository_1 = require("../repositories/userRepository");
const resource_1 = require("../utils/resources/resource");
/**
 * Service for user business logic.
 * Handles user operations including authentication and data sanitization.
 */
class UserService {
    constructor() {
        this.userRepository = new userRepository_1.UserRepository();
    }
    /**
     * Removes sensitive fields from the user object.
     *
     * @summary Sanitizes user data by removing password.
     * @param data - Raw user object with sensitive fields.
     * @returns User object without the password.
     */
    sanitizeUser(data) {
        const { password } = data, safeUser = __rest(data, ["password"]);
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
    async createUser(data) {
        data.email = data.email.trim().toLowerCase();
        const existingUsers = await this.userRepository.findMany({
            email: { operator: enum_1.Operator.EQUAL, value: data.email }
        });
        if (existingUsers.length > 0) {
            return { success: false, error: resource_1.Resource.EMAIL_IN_USE };
        }
        data.password = await bcrypt_1.default.hash(data.password, 10);
        const created = await this.userRepository.create(data);
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
    async getUsers(options) {
        try {
            const users = await this.userRepository.findMany(undefined, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: options === null || options === void 0 ? void 0 : options.sort,
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? "desc" : "asc",
            });
            return {
                success: true,
                data: users.map(u => this.sanitizeUser(u))
            };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Counts all users.
     *
     * @summary Gets total count of users.
     * @returns Total user count.
     */
    async countUsers() {
        try {
            const count = await this.userRepository.count();
            return { success: true, data: count };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Retrieves a user by their unique ID.
     *
     * @summary Gets a single user by ID.
     * @param id - ID of the user.
     * @returns User record if found, or error if not.
     */
    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            return { success: false, error: resource_1.Resource.USER_NOT_FOUND };
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
    async getUsersByEmail(emailTerm, options) {
        try {
            const result = await this.userRepository.findMany({
                email: { operator: enum_1.Operator.LIKE, value: emailTerm }
            }, {
                limit: options === null || options === void 0 ? void 0 : options.limit,
                offset: options === null || options === void 0 ? void 0 : options.offset,
                sort: options === null || options === void 0 ? void 0 : options.sort,
                order: (options === null || options === void 0 ? void 0 : options.order) === enum_1.Operator.DESC ? "desc" : "asc",
            });
            return {
                success: true,
                data: result.map(u => this.sanitizeUser(u))
            };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
        }
    }
    /**
     * Counts users matching an email term.
     *
     * @summary Gets count of users matching email pattern.
     * @param emailTerm - Email search term.
     * @returns Count of matching users.
     */
    async countUsersByEmail(emailTerm) {
        try {
            const count = await this.userRepository.count({
                email: { operator: enum_1.Operator.LIKE, value: emailTerm }
            });
            return { success: true, data: count };
        }
        catch (error) {
            return { success: false, error: resource_1.Resource.INTERNAL_SERVER_ERROR };
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
    async updateUser(id, data) {
        const current = await this.userRepository.findById(id);
        if (!current) {
            return { success: false, error: resource_1.Resource.NO_RECORDS_FOUND };
        }
        if (data.password && current.password) {
            const isSamePassword = await bcrypt_1.default.compare(data.password, current.password);
            if (!isSamePassword) {
                data.password = await bcrypt_1.default.hash(data.password, 10);
            }
            else {
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
     * Deletes a user by ID after validating its existence.
     *
     * @summary Removes a user from the database.
     * @param id - ID of the user to delete.
     * @returns Success with deleted ID, or error if user does not exist.
     */
    async deleteUser(id) {
        const existingUser = await this.userRepository.findById(id);
        if (!existingUser) {
            return { success: false, error: resource_1.Resource.USER_NOT_FOUND };
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
    async findOne(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            return { success: false, error: resource_1.Resource.USER_NOT_FOUND };
        }
        return { success: true, data: user };
    }
}
exports.UserService = UserService;
