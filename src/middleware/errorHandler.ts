import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  // Prisma errors
  if (err.code === "P2002") {
    return sendError(res, "Duplicate entry found", 409);
  }

  if (err.code === "P2025") {
    return sendError(res, "Record not found", 404);
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return sendError(res, err.message, 400);
  }

  // Default error
  return sendError(res, "Internal Server Error", 500);
};

export const notFound = (req: Request, res: Response) => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
};
