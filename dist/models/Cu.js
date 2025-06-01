"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const cuSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    region: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Region', required: true },
    contactEmail: { type: String },
    contactPhone: { type: String },
    address: { type: String },
    street: { type: String },
    longitude: { type: Number, required: false },
    latitude: { type: Number, required: false },
    familiesEnabled: { type: Boolean, default: false },
}, {
    timestamps: true,
});
const CU = (0, mongoose_1.model)('CU', cuSchema);
exports.default = CU;
