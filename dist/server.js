"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
// Import routes
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
// Import Prisma client
const prisma_1 = __importDefault(require("./utils/prisma"));
// Environment variables are loaded in prisma.ts
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000").split(",");
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        else {
            console.log(`Origin ${origin} not allowed by CORS`);
            return callback(null, true); // Allow all origins in development
        }
    },
    credentials: true,
}));
// Logging
app.use((0, morgan_1.default)("combined"));
// Body parsing middleware
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});
// API routes
app.use("/api/courses", courseRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
// 404 handler
app.use(errorHandler_1.notFound);
// Error handler
app.use(errorHandler_1.errorHandler);
// For local development, start the server if not in production
if (process.env.NODE_ENV !== 'production') {
    const server = app.listen(PORT, async () => {
        try {
            // Test database connection with timeout to prevent hanging
            const connectionPromise = prisma_1.default.$queryRaw `SELECT 1`;
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout')), 5000));
            await Promise.race([connectionPromise, timeoutPromise]);
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`✅ Database connection successful`);
            console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
        }
        catch (error) {
            console.error("❌ Failed to start server properly:", error);
            console.error("❌ Database connection failed");
            // Keep server running but log the error
        }
    });
    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
        console.error("Unhandled Rejection at:", promise, "reason:", reason);
    });
}
// Export the Express app for serverless functions
exports.default = app;
