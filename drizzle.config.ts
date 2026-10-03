import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/**/*.schema.ts", // Schema files are spread across different feature directories
  out: "./drizzle",
});
