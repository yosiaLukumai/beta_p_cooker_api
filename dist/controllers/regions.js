"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRegion = exports.deleteRegion = exports.getallRegions = exports.getRegions = exports.createRegion = void 0;
const Region_1 = require("../models/Region");
const response_1 = require("../util/response");
const querying_1 = require("../util/querying");
const createRegion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, contact } = req.body;
        const saved = yield Region_1.Region.create({ name, contact, email });
        if (!saved) {
            return res.json((0, response_1.CreateResponse)(false, null, "Failed to create region"));
        }
        return res.json((0, response_1.CreateResponse)(true, "region created successfully"));
    }
    catch (error) {
        return res.json((0, response_1.CreateResponse)(false, null, error));
    }
});
exports.createRegion = createRegion;
const getRegions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.query, { page: pageQuery, limit: limitQuery, search } = _a, filter = __rest(_a, ["page", "limit", "search"]);
        const { page, limit } = (0, querying_1.CreateLimitPage)(pageQuery, limitQuery);
        const skip = (page - 1) * limit;
        const queryConditions = Object.assign({}, filter);
        // let add some sort of regex to search
        if (search) {
            queryConditions.name = { $regex: search, $options: 'i' };
            // If you are searching across multiple fields using $or:
            // const searchConditions = [];
            // searchConditions.push({ name: { $regex: search as string, $options: 'i' } });
            // // ... other fields with the $regex option
            // queryConditions.$or = searchConditions;
        }
        const query = Region_1.Region.find(queryConditions);
        const [docs, totalDocs] = yield Promise.all([
            query.skip(skip).limit(limit).exec(),
            Region_1.Region.countDocuments(filter).exec(),
        ]);
        const data = (0, querying_1.CreatePaginatedOutput)(limit, totalDocs, page, docs);
        if (!data) {
            return res.json((0, response_1.CreateResponse)(false, null, "Failed to get regions"));
        }
        return res.json((0, response_1.CreateResponse)(true, data));
    }
    catch (error) {
        return res.json((0, response_1.CreateResponse)(false, null, error));
    }
});
exports.getRegions = getRegions;
const getallRegions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const regions = yield Region_1.Region.find();
    if (!regions) {
        return res.json((0, response_1.CreateResponse)(false, null, "Failed to get regions"));
    }
    return res.json((0, response_1.CreateResponse)(true, regions));
});
exports.getallRegions = getallRegions;
const deleteRegion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield Region_1.Region.findByIdAndDelete(id);
        if (!deleted) {
            return res.json((0, response_1.CreateResponse)(false, null, "Failed to delete region"));
        }
        return res.json((0, response_1.CreateResponse)(true, "Region deleted successfully"));
    }
    catch (error) {
        return res.json((0, response_1.CreateResponse)(false, null, error));
    }
});
exports.deleteRegion = deleteRegion;
const updateRegion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, email, contact } = req.body;
        const updated = yield Region_1.Region.findByIdAndUpdate(id, { name, email, contact });
        if (!updated) {
            return res.json((0, response_1.CreateResponse)(false, null, "Failed to update region"));
        }
        return res.json((0, response_1.CreateResponse)(true, "Region updated successfully"));
    }
    catch (error) {
        return res.json((0, response_1.CreateResponse)(false, null, error));
    }
});
exports.updateRegion = updateRegion;
