import { defineConfig } from "drizzle-kit";

// Use dev.db for local development if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || './dev.db';

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema-sqlite.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
  },
});
