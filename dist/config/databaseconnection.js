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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectToDatabase = ConnectToDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const process_1 = require("process");
function ConnectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let databaseConnection = process.env.DATABASE_CONNECTION_STR;
            if (!databaseConnection) {
                console.log("No database connection string found");
                (0, process_1.exit)(1);
            }
            const connection = yield mongoose_1.default.connect(databaseConnection);
            console.log(`MongoDB Connected: ${connection.connection.host}`);
        }
        catch (error) {
            console.log(error);
        }
    });
}
