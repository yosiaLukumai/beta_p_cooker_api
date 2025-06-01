"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadershipPosition = void 0;
const mongoose_1 = require("mongoose");
const LeadershipPositionSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String, enum: ["CU", "Regional", "National"], required: true },
}, { timestamps: true });
exports.LeadershipPosition = (0, mongoose_1.model)("LeadershipPosition", LeadershipPositionSchema);
