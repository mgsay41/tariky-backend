import { Response } from "express";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200,
  pagination?: ApiResponse<T>["pagination"]
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string = "Internal Server Error",
  statusCode: number = 500,
  error?: string
): Response => {
  const response: ApiResponse<null> = {
    success: false,
    message,
    ...(error && { error }),
  };
  return res.status(statusCode).json(response);
};
