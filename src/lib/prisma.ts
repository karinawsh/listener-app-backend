import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client.js";

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// When using Prisma Accelerate (prisma+postgres://), pass the URL as accelerateUrl
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

export default prisma;