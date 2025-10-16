"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectWithRetry = connectWithRetry;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from the correct path
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env") });
// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined in environment variables");
    // Don't exit in production to allow serverless function to continue
    if (process.env.NODE_ENV !== "production") {
        process.exit(1);
    }
}
// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit in serverless environments
const globalForPrisma = global;
// Configure Prisma client options
const prismaClientOptions = {
    log: process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
};
// In serverless environments, we need to handle connection pooling carefully
// Create or reuse Prisma client instance
const prisma = globalForPrisma.prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === "development"
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
// Save prisma client to global object to reuse connections
// This is important for serverless environments to prevent connection exhaustion
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
else {
    // In production, we still want to cache the client but handle differently
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = prisma;
    }
}
// Connection testing function with improved serverless handling
async function connectWithRetry(retries = 3, delay = 3000) {
    // In serverless environments, we don't want to retry too many times
    // as it will increase cold start time
    const serverlessRetries = process.env.NODE_ENV === 'production' ? 1 : retries;
    const serverlessDelay = process.env.NODE_ENV === 'production' ? 1000 : delay;
    let currentTry = 0;
    while (currentTry < serverlessRetries) {
        try {
            await prisma.$queryRaw `SELECT 1`;
            if (process.env.NODE_ENV !== 'production') {
                console.log("Successfully connected to the database");
            }
            return true;
        }
        catch (error) {
            currentTry++;
            console.error(`Database connection attempt ${currentTry} failed:`, error);
            if (currentTry >= serverlessRetries) {
                console.error("Max retries reached. Could not connect to database.");
                // In production, we don't want to throw an error as it will crash the serverless function
                if (process.env.NODE_ENV !== 'production') {
                    throw error;
                }
                return false;
            }
            if (process.env.NODE_ENV !== 'production') {
                console.log(`Retrying in ${serverlessDelay}ms...`);
            }
            await new Promise(resolve => setTimeout(resolve, serverlessDelay));
        }
    }
    return false;
}
// Initialize connection in non-serverless environments
if (process.env.NODE_ENV !== 'production') {
    connectWithRetry().catch(console.error);
}
exports.default = prisma;
