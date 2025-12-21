"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
exports.buildMeta = buildMeta;
const enum_1 = require("./enum");
function parsePagination(query) {
    var _a;
    const page = Math.max(parseInt(query.page) || 1, 1);
    const pageSize = Math.max(parseInt(query.pageSize) || parseInt(query.limit) || 10, 1);
    const limit = query.limit ? parseInt(query.limit) : pageSize;
    const offset = query.offset ? parseInt(query.offset) : (page - 1) * pageSize;
    const sort = query.sort;
    const orderParam = (_a = query.order) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    const order = orderParam === 'desc' ? enum_1.Operator.DESC : enum_1.Operator.ASC;
    return { page, pageSize, limit, offset, sort, order };
}
function buildMeta({ page, pageSize, total }) {
    const pageCount = pageSize ? Math.ceil(total / pageSize) : 0;
    return { page, pageSize, total, pageCount };
}
