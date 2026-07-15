import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(process.cwd(), ".env.mongo") });

const prisma = new PrismaClient({
    errorFormat: 'minimal'
});

export default prisma;
