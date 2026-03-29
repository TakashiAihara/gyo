import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "./schema";

export type AppDB = NeonHttpDatabase<typeof schema> | PgliteDatabase<typeof schema>;

const sql = neon(process.env.DATABASE_URL!);
export const db: AppDB = drizzle(sql, { schema });
