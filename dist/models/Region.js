"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Region = void 0;
const mongoose_1 = require("mongoose");
const RegionSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    country: { type: String, default: "Tanzania" },
    contact: { type: String, required: true },
    email: { type: String, required: true, unique: true },
}, { timestamps: true });
exports.Region = (0, mongoose_1.model)("Region", RegionSchema);
