"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);
    console.error("Stack trace:", err.stack);
    // Database connection errors
    if (err.message && err.message.includes("connect")) {
        console.error("Database connection error:", err.message);
        return (0, response_1.sendError)(res, "Database connection error: " + err.message, 500);
    }
    // Prisma errors
    if (err.code === "P2002") {
        return (0, response_1.sendError)(res, "Duplicate entry found", 409);
    }
    if (err.code === "P2025") {
        return (0, response_1.sendError)(res, "Record not found", 404);
    }
    // Validation errors
    if (err.name === "ValidationError") {
        return (0, response_1.sendError)(res, err.message, 400);
    }
    // Default error with more details
    const errorMessage = process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : `Error: ${err.message || "Unknown error"}`;
    return (0, response_1.sendError)(res, errorMessage, 500);
};
exports.errorHandler = errorHandler;
const notFound = (req, res) => {
    return (0, response_1.sendError)(res, `Route ${req.originalUrl} not found`, 404);
};
exports.notFound = notFound;
