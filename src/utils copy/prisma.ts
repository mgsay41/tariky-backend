import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined in environment variables");
  process.exit(1);
}

// Create Prisma client with connection retry logic
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Connection testing function
async function connectWithRetry(retries = 5, delay = 5000) {
  let currentTry = 0;
  
  while (currentTry < retries) {
    try {
      await prisma.$connect();
      console.log("Successfully connected to the database");
      return;
    } catch (error) {
      currentTry++;
      console.error(`Database connection attempt ${currentTry} failed:`, error);
      
      if (currentTry >= retries) {
        console.error("Max retries reached. Could not connect to database.");
        throw error;
      }
      
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Initialize connection
connectWithRetry().catch(console.error);

export default prisma;
