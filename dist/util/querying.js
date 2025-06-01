"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLimitPage = exports.CreatePaginatedOutput = void 0;
const config_1 = require("../config/config");
const CreatePaginatedOutput = (limit, totalDocs, page, data) => {
    const totalPages = Math.ceil(totalDocs / limit);
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;
    const pagingCounter = (page - 1) * limit + 1;
    return {
        docs: data,
        totalDocs,
        limit,
        totalPages,
        page,
        pagingCounter,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
    };
};
exports.CreatePaginatedOutput = CreatePaginatedOutput;
const CreateLimitPage = (pageQuery, limitQuery) => {
    const page = parseInt(pageQuery, 10) || config_1.queryConfig.defaultPage;
    const limit = parseInt(limitQuery, 10) || config_1.queryConfig.defaultLimit;
    return {
        page,
        limit,
    };
};
exports.CreateLimitPage = CreateLimitPage;
