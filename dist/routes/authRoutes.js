"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controller/authController");
const commons_1 = require("../utils/commons");
const enum_1 = require("../utils/enum");
const router = (0, express_1.Router)();
/**
 * @route POST /login
 * @description Authenticates a user and sets a refresh token cookie.
 */
router.post('/login', async (req, res, next) => {
    try {
        await authController_1.AuthController.login(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.LOGIN, enum_1.LogCategory.AUTH, (0, commons_1.formatError)(error), undefined, next);
    }
});
/**
 * @route POST /refresh
 * @description Issues a new access token using a valid refresh token from cookies.
 */
router.post('/refresh', async (req, res, next) => {
    try {
        await authController_1.AuthController.refresh(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.UPDATE, enum_1.LogCategory.AUTH, (0, commons_1.formatError)(error), undefined, next);
    }
});
/**
 * @route POST /logout
 * @description Logs out the user by revoking the refresh token and clearing the cookie.
 */
router.post('/logout', async (req, res, next) => {
    try {
        await authController_1.AuthController.logout(req, res, next);
    }
    catch (error) {
        await (0, commons_1.createLog)(enum_1.LogType.ERROR, enum_1.LogOperation.LOGOUT, enum_1.LogCategory.AUTH, (0, commons_1.formatError)(error), undefined, next);
    }
});
exports.default = router;
