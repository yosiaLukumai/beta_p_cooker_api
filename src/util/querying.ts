import { queryConfig } from "../config/config";

export interface PaginationOptions {
    page: number;
    limit: number;
}

export interface PaginatedResult<T> {
    docs: T[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: number | null;
    nextPage: number | null;
}


export const CreatePaginatedOutput = (limit: number, totalDocs: number, page: number, data: any): PaginatedResult<any> => {
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
}

export const CreateLimitPage = (pageQuery: any, limitQuery: any): PaginationOptions => {
    const page = parseInt(pageQuery as string, 10) || queryConfig.defaultPage;
    const limit = parseInt(limitQuery as string, 10) || queryConfig.defaultLimit;
    return {
        page,
        limit,
    };
}