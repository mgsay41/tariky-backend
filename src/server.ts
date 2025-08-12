import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";

// Import routes
import courseRoutes from "./routes/courseRoutes";

// Import middleware
import { errorHandler, notFound } from "./middleware/errorHandler";

// Import Prisma client
import prisma from "./utils/prisma";

// Environment variables are loaded in prisma.ts

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = (
        process.env.CORS_ORIGIN || "http://localhost:3000"
      ).split(",");
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        console.log(`Origin ${origin} not allowed by CORS`);
        return callback(null, true); // Allow all origins in development
      }
    },
    credentials: true,
  })
);

// Logging
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
app.use("/api/courses", courseRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// For local development, start the server if not in production
let server;
if (process.env.NODE_ENV !== 'production') {
  server = app.listen(PORT, async () => {
    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Database connection successful`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
    } catch (error) {
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
export default app;
