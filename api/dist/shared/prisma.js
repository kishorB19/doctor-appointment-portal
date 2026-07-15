"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env.mongo") });
const prisma = new client_1.PrismaClient({
    errorFormat: 'minimal'
});
exports.default = prisma;
