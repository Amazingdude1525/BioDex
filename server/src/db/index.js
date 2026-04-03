import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  console.error("🚨 CRITICAL: DATABASE_URL is MISSING or blank in the Node process!");
}
const sql = neon(process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost/dummy");
const db = drizzle(sql, { schema });

export default db;
