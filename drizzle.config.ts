import { defineConfig } from "drizzle-kit";
import "./envConfig.ts";

export default defineConfig({
    out: "./drizzle",
    schema: "./db/schema",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    casing: "snake_case",
});
