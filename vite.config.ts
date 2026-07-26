import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [tanstackRouter({ target: "react" }), react(), tailwindcss()],
  resolve: {
    alias: {
      src: resolve(__dirname, "src"),
    },
  },
});
