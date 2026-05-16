import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schemas";
import { logger } from "../utils/logger";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

export const db = drizzle({ client: pool, schema });

export const connectDb = async () => {
  try {
    await pool.connect();
    logger.info("Database connected");
  } catch (error) {
    logger.error({ error }, "Failed to connect to database");
    process.exit(1);
  }
};

export const disconnectDb = async () => {
  try {
    await pool.end();
    logger.info("Database disconnected");
  } catch (error) {
    logger.error({ error }, "Failed to disconnect from database");
  }
};
