"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateResponse = void 0;
const CreateResponse = (success, body, error) => {
    return {
        success,
        body,
        error: (error === null || error === void 0 ? void 0 : error.message) || (error === null || error === void 0 ? void 0 : error._message) || error || null,
    };
};
exports.CreateResponse = CreateResponse;
