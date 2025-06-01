"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = require("./routes/users");
const region_1 = require("./routes/region");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// testing the server
app.get("/ping", (req, res) => {
    res.send("pong");
});
(0, users_1.userRoutes)(app);
(0, region_1.regionRoutes)(app);
exports.default = app;
