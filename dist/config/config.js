"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    port: Number(process.env.PORT) || 2313,
    nodeEnv: process.env.NODE_ENV || 'development',
};
const queryConfig = {
    defaultPage: Number(process.env.DEFAULT_PAGE) || 1,
    defaultLimit: Number(process.env.DEFAULT_LIMIT) || 10,
};
exports.queryConfig = queryConfig;
exports.default = config;
