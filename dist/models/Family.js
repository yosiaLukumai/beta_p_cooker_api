"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Family = void 0;
const mongoose_1 = require("mongoose");
const FamilySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    college: { type: mongoose_1.Schema.Types.ObjectId, ref: "College", required: true },
    leader: { type: mongoose_1.Schema.Types.ObjectId, ref: "Student", required: true },
}, { timestamps: true });
exports.Family = (0, mongoose_1.model)("Family", FamilySchema);
