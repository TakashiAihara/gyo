import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./packages/server/src/db/schema.ts",
  out: "./packages/server/src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
