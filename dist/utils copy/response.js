"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = "Success", statusCode = 200, pagination) => {
    const response = {
        success: true,
        message,
        data,
        ...(pagination && { pagination }),
    };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message = "Internal Server Error", statusCode = 500, error) => {
    const response = {
        success: false,
        message,
        ...(error && { error }),
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
