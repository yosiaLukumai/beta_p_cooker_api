"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Leadership = void 0;
const mongoose_1 = require("mongoose");
const LeadershipSchema = new mongoose_1.Schema({
    student: { type: mongoose_1.Schema.Types.ObjectId, ref: "Student", required: true },
    roles: [
        {
            position: { type: mongoose_1.Schema.Types.ObjectId, ref: "LeadershipPosition", required: true },
            category: { type: String, enum: ["CU", "Regional", "National"], required: true },
            department: { type: mongoose_1.Schema.Types.ObjectId, ref: "LeadershipDepartment" },
            college: { type: mongoose_1.Schema.Types.ObjectId, ref: "College" },
            region: { type: mongoose_1.Schema.Types.ObjectId, ref: "Region" },
            term_start: { type: Date, required: true, default: Date.now },
            term_end: { type: Date, required: true, default: () => new Date(new Date().setFullYear(new Date().getFullYear() + 1)) },
            banned: { type: Boolean, default: false },
        },
    ],
    total_terms: { type: Number, default: 0 },
}, { timestamps: true });
exports.Leadership = (0, mongoose_1.model)("Leadership", LeadershipSchema);
